import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ConversionModes from './ConversionModes'
import { Comparison } from '@/components/ui/comparison'
import CropEditorEasy from './CropEditorEasy'
import { UploadButton } from '@/components/UploadButton'
import { useHybridCounter } from '@/hooks/useHybridCounter'
  import {
    CONVERSION_MODES,
    applyConversion,
    loadImageFromFile,
    type ConversionMode,
    type ConversionOptions,
    cropCircleFromRect,
    hexToRgb,
    rgbToHex,
    DUOTONE_COLORS,
  } from '@/utils/image/convert'
import { Download, Upload, FileUp, Cat, Shield, AlertCircle, RotateCcw, Crop, Palette, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ConversionPanel Component
 *
 * The main interface for image processing and conversion in the application.
 * Provides a complete workflow from file upload to processed image download.
 *
 * Features:
 * - Drag and drop file upload with validation
 * - Real-time image conversion with multiple modes
 * - Before/after comparison slider
 * - Download functionality for processed images
 * - Processing counter with database persistence and race condition protection
 * - Safety notifications about local processing
 * - Responsive grid layout for desktop and mobile
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 */
export default function ConversionPanel({
  className,
  ...props
}: {
  className?: string
} & React.ComponentProps<'div'>) {
  const { t, i18n } = useTranslation()
  const { stats, incrementCounter } = useHybridCounter()

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [originalSrc, setOriginalSrc] = useState<string | null>(null)
  const [originalCroppedSrc, setOriginalCroppedSrc] = useState<string | null>(null)
  const [convertedSrc, setConvertedSrc] = useState<string | null>(null)
  const [conversionMode, setConversionMode] = useState<ConversionMode>(CONVERSION_MODES.DUOTONE_GP)
  const [isCropping, setIsCropping] = useState<boolean>(false)
  const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [colorBlindMode, setColorBlindMode] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  // Advanced settings state
  const [advancedSettings, setAdvancedSettings] = useState({
    darkColor: rgbToHex(DUOTONE_COLORS.PINK),
    lightColor: rgbToHex(DUOTONE_COLORS.GREEN),
    darkIntensity: 1.0,
    lightIntensity: 1.0,
    contrast: 1.15,
    brightness: 0.0,
  })

  // Refs for DOM elements
  const dragRef = useRef<HTMLDivElement | null>(null)

  /**
   * Load processing counter from database on component mount
   */
  useEffect(() => {
    // Counter is automatically loaded by useHybridCounter hook
  }, [])

  /**
   * Auto-convert image when conversion mode or advanced settings change (if image is loaded)
   */
  useEffect(() => {
    if (originalImage) {
      handleConvert()
    }
  }, [conversionMode, originalImage, cropArea, colorBlindMode, advancedSettings])

  /**
   * Validates uploaded file for type and size constraints
   *
   * @param file - The file to validate
   * @returns True if file is valid, false otherwise
   */
  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError(t('errors.fileTypeError'))
      return false
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t('errors.fileSizeError'))
      return false
    }

    setError('')
    return true
  }

  /**
   * Handles file selection from upload button or drag and drop
   * Validates file and loads it as an image for processing
   *
   * @param files - FileList containing selected files
   */
  const handleFileSelect = async (files: FileList): Promise<void> => {
    const file = files[0]
    if (!file || !validateFile(file)) return

    try {
      // Revoke previous blob URL if any
      try {
        if (originalSrc && originalSrc.startsWith('blob:')) URL.revokeObjectURL(originalSrc)
      } catch {}
      setSelectedFile(file)
      setError('')

      // Load image
      const img = await loadImageFromFile(file)
      // Guard against extremely large images (prevent memory/DoS issues)
      const MAX_PIXELS = 24000000 // ~24MP (e.g., 6000x4000)
      const px = (img.naturalWidth || (img as any).width) * (img.naturalHeight || (img as any).height)
      if (px > MAX_PIXELS) {
        setError(t('errors.imageTooLarge', 'Image dimensions are too large to process safely'))
        return
      }
      setOriginalImage(img)
      setOriginalSrc(img.src)
      setOriginalCroppedSrc(null)
      setConvertedSrc(img.src) // Initially show original

    } catch (err) {
      console.error('Error loading image:', err)
      setError(t('errors.processingError'))
    }
  }

  /**
   * Handles image conversion with the selected mode and advanced settings
   * Updates counter using database with race condition protection
   */
  const handleConvert = async (
    baseOverride?: HTMLImageElement | null,
    opts?: { skipIncrement?: boolean }
  ): Promise<void> => {
    if (!originalImage) return

    setError('')
    try {
      // Determine base image: override > cropped > original
      let baseImage: HTMLImageElement = originalImage
      if (baseOverride) {
        baseImage = baseOverride
      } else if (originalCroppedSrc) {
        const tmp = new Image()
        await new Promise<void>((res, rej) => { tmp.onload = () => res(); tmp.onerror = () => rej(new Error('failed')); tmp.src = originalCroppedSrc! })
        baseImage = tmp
      }

      // Prepare conversion options with advanced settings
      const conversionOptions: ConversionOptions = {
        colorBlind: colorBlindMode,
        customColors: {
          darkColor: hexToRgb(advancedSettings.darkColor),
          lightColor: hexToRgb(advancedSettings.lightColor),
          darkIntensity: advancedSettings.darkIntensity,
          lightIntensity: advancedSettings.lightIntensity,
          contrast: advancedSettings.contrast,
          brightness: advancedSettings.brightness,
        }
      }

      const result = await applyConversion(baseImage, conversionMode, conversionOptions)
      setConvertedSrc(result)

      if (!opts?.skipIncrement) {
        await incrementCounter(selectedFile?.name || 'converted_image.png')
      }
    } catch (err) {
      console.error('Conversion error:', err)
      setError(t('errors.processingError'))
    }
  }

  const handleApplyCrop = async (areaPixels: { x: number; y: number; width: number; height: number }) => {
    if (!originalImage) return
    try {
      setCropArea(areaPixels)
      // Create cropped original (circle PNG)
      const before = await cropCircleFromRect(originalImage, areaPixels)
      // Immediately convert using this cropped base to avoid state race
      const tmp = new Image()
      await new Promise<void>((res, rej) => { tmp.onload = () => res(); tmp.onerror = () => rej(new Error('failed')); tmp.src = before })
      const result = await applyConversion(tmp, conversionMode, { colorBlind: colorBlindMode })
      setOriginalCroppedSrc(before)
      setConvertedSrc(result)
      setIsCropping(false)
      await incrementCounter(selectedFile?.name || 'converted_image.png')
    } catch (e) {
      console.error('Crop error:', e)
      setError(t('errors.processingError'))
    }
  }
  /**
   * Handles download of the converted image
   * Creates a temporary download link and triggers download
   */
  const handleDownload = (): void => {
    if (!convertedSrc) return

    const link = document.createElement('a')
    let baseName = selectedFile?.name ? selectedFile.name.replace(/\.[^.]+$/, '') : 'image'
    // Sanitize filename to avoid special chars
    baseName = baseName.replace(/[^\w\-]+/g, '_')
    link.download = `converted_${baseName}.png`
    link.href = convertedSrc
    link.click()
  }

  /**
   * Resets all state to initial values for new image processing
   */
  const handleReset = (): void => {
    try {
      if (originalSrc && originalSrc.startsWith('blob:')) URL.revokeObjectURL(originalSrc)
    } catch {}
    setSelectedFile(null)
    setOriginalImage(null)
    setOriginalSrc(null)
    setConvertedSrc(null)
    setConversionMode(CONVERSION_MODES.DUOTONE_GP)
    setError('')
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Upload State */}
      {!originalSrc && (
        <Card>
          <CardContent className="p-8">
            <div
              ref={dragRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  {i18n.language === 'ja' ? (
                    <Cat className="w-16 h-16 text-muted-foreground" />
                  ) : (
                    <FileUp className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('hero.uploadTitle')}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {t('hero.uploadDescription')}
                  </p>
                </div>
                <UploadButton
                  accept=".jpg,.jpeg,.png,.webp"
                  onFiles={handleFileSelect}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('hero.uploadButton')}
                </UploadButton>
                <p className="text-xs text-muted-foreground">
                  {t('hero.uploadFormats')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview in Single Column Card (no loading spinner for seamless UX) */}
      {originalSrc && (
        <Card>
          <CardContent className="p-6">
              <div className={cn('bg-muted overflow-hidden flex items-center justify-center relative rounded-lg')}>
              {convertedSrc && originalSrc ? (
                isCropping ? (
                  <div className="w-full">
                    <CropEditorEasy
                      imageSrc={originalSrc}
                      onCancel={() => setIsCropping(false)}
                      onConfirm={(area) => handleApplyCrop(area)}
                      className="max-h-[calc(100vh-20rem)]"
                    />
                  </div>
                ) : (
                  <Comparison
                    key={`${conversionMode}-${convertedSrc.length}-${originalCroppedSrc ? 'c' : 'nc'}`}
                    beforeSrc={originalCroppedSrc || originalSrc}
                    afterSrc={convertedSrc}
                    alt={t('accessibility.compareSlider')}
                    className="max-h-[calc(100vh-20rem)] w-full"
                    naturalWidth={originalCroppedSrc ? 1 : originalImage?.naturalWidth}
                    naturalHeight={originalCroppedSrc ? 1 : originalImage?.naturalHeight}
                    objectFit={originalCroppedSrc ? 'contain' : 'contain'}
                    initialPosition={50}
                    beforeLabel={t('comparison.before', 'Before')}
                    afterLabel={t('comparison.after', 'After')}
                  />
                )
              ) : (
                <Skeleton className="w-full h-full aspect-video" />
              )}
              </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Controls Card */}
      {originalSrc && (
        <Card>
          <CardContent className="p-6">
            {/* Mobile First: Stack layout */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Action Buttons */}
              <div className="order-2 sm:order-1 flex flex-col w-full items-stretch gap-2 sm:flex-row sm:items-center sm:w-auto">
                <Button
                  onClick={() => setColorBlindMode((v) => !v)}
                  variant={colorBlindMode ? 'default' : 'secondary'}
                  size="sm"
                  className="w-full sm:w-auto sm:min-w-[7rem]"
                  aria-pressed={colorBlindMode}
                >
                  <Palette className="w-4 h-4 mr-2" aria-hidden />
                  {colorBlindMode ? t('conversion.actions.cbOn', 'Color‑Blind On') : t('conversion.actions.cbOff', 'Color‑Blind Mode')}
                </Button>
                <Button
                  onClick={() => setIsCropping(true)}
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto sm:min-w-[7rem] disabled:opacity-50"
                  disabled={!originalSrc}
                >
                  <Crop className="w-4 h-4 mr-2" aria-hidden />
                  {originalCroppedSrc ? t('conversion.actions.editCrop', 'Edit Crop') : t('conversion.actions.crop', 'Crop')}
                </Button>
                {originalCroppedSrc && (
                  <Button
                    onClick={() => { setOriginalCroppedSrc(null); setCropArea(null); if (originalImage) handleConvert(originalImage, { skipIncrement: true }) }}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto sm:min-w-[7rem]"
                  >
                    <Crop className="w-4 h-4 mr-2 rotate-180" aria-hidden />
                    {t('conversion.actions.removeCrop', 'Remove Crop')}
                  </Button>
                )}
                {convertedSrc && convertedSrc !== originalSrc && (
                  <Button
                    onClick={handleDownload}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto sm:min-w-[7rem]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('conversion.actions.save')}
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto sm:min-w-[7rem]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('conversion.actions.reset')}
                </Button>
              </div>

              {/* Duotone Mode Buttons */}
              <div className="order-1 sm:order-2 flex justify-center w-full sm:w-auto sm:justify-end">
                <ConversionModes
                  value={conversionMode}
                  onChange={setConversionMode}
                  disabled={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings Card */}
      {originalSrc && (
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced-settings">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">{t('conversion.advanced.title')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    {/* Gradient Colors */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">{t('conversion.advanced.gradientColors')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">{t('conversion.advanced.darkColor')}</label>
                          <div className="flex items-center gap-2">
                            <ColorPicker
                              value={advancedSettings.darkColor}
                              onChange={(color) => setAdvancedSettings(prev => ({
                                ...prev,
                                darkColor: color
                              }))}
                            />
                            <span className="text-xs text-muted-foreground font-mono">
                              {advancedSettings.darkColor}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">{t('conversion.advanced.lightColor')}</label>
                          <div className="flex items-center gap-2">
                            <ColorPicker
                              value={advancedSettings.lightColor}
                              onChange={(color) => setAdvancedSettings(prev => ({
                                ...prev,
                                lightColor: color
                              }))}
                            />
                            <span className="text-xs text-muted-foreground font-mono">
                              {advancedSettings.lightColor}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intensity Controls */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">{t('conversion.advanced.colorIntensity')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">{t('conversion.advanced.darkIntensity')}</label>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(advancedSettings.darkIntensity * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[advancedSettings.darkIntensity]}
                            onValueChange={([value]) => setAdvancedSettings(prev => ({
                              ...prev,
                              darkIntensity: value
                            }))}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">{t('conversion.advanced.lightIntensity')}</label>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(advancedSettings.lightIntensity * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[advancedSettings.lightIntensity]}
                            onValueChange={([value]) => setAdvancedSettings(prev => ({
                              ...prev,
                              lightIntensity: value
                            }))}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Adjustments */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">{t('conversion.advanced.imageAdjustments')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">{t('conversion.advanced.contrast')}</label>
                            <span className="text-xs text-muted-foreground">
                              {advancedSettings.contrast.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[advancedSettings.contrast]}
                            onValueChange={([value]) => setAdvancedSettings(prev => ({
                              ...prev,
                              contrast: value
                            }))}
                            min={0.5}
                            max={2}
                            step={0.01}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">{t('conversion.advanced.brightness')}</label>
                            <span className="text-xs text-muted-foreground">
                              {advancedSettings.brightness > 0 ? '+' : ''}{advancedSettings.brightness.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[advancedSettings.brightness]}
                            onValueChange={([value]) => setAdvancedSettings(prev => ({
                              ...prev,
                              brightness: value
                            }))}
                            min={-1}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setAdvancedSettings({
                          darkColor: rgbToHex(DUOTONE_COLORS.PINK),
                          lightColor: rgbToHex(DUOTONE_COLORS.GREEN),
                          darkIntensity: 1.0,
                          lightIntensity: 1.0,
                          contrast: 1.15,
                          brightness: 0.0,
                        })}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('conversion.advanced.resetDefaults')}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}


      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Bar: Counter (kiri) + Safety Notice (kanan) */}
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
          {/* Counter - Left */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">
              {stats.total_count > 0 || stats.is_animating ? (
                <span className="flex items-center gap-2">
                  <span className="transition-all duration-300">
                    {stats.is_animating ? (stats.display_count || 0) : stats.total_count}
                  </span>
                  <span>
                    {t('conversion.counter.files')}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">0 {t('conversion.counter.files')}</span>
              )}
            </span>
          </div>

          {/* Safety Notice - Right */}
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t('conversion.safety.local')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
