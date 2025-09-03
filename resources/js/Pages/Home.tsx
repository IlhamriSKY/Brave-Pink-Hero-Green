import { Head } from '@inertiajs/react'
import AppLayout from '@/components/AppLayout'
import ConversionPanel from '@/components/conversion/ConversionPanel'

/**
 * Home Page Component
 *
 * The main landing page for the Brave Pink Hero Green application.
 * Features the primary image conversion interface with duotone effects.
 *
 * @returns JSX element representing the home page
 */
export default function Home() {
    return (
        <>
            <Head title="Brave Pink Hero Green" />
            <AppLayout>
                <ConversionPanel />
            </AppLayout>
        </>
    )
}
