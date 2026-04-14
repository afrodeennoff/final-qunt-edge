import { Logo } from '@/components/logo'
import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(145deg, #130f1d 0%, #0d0915 50%, #09060f 100%)',
                    borderRadius: '22%',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 40% 35%, oklch(0.6083 0.2172 297.1153 / 0.18) 0%, transparent 65%)',
                        borderRadius: '22%',
                    }}
                />
                <svg
                    viewBox="0 0 255 255"
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    fill="white"
                    style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 4px rgba(145,108,255,0.6))' }}
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M159 63L127.5 0V255H255L236.5 218H159V63Z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M-3.05176e-05 255L127.5 -5.96519e-06L127.5 255L-3.05176e-05 255ZM64 217L121 104L121 217L64 217Z" />
                </svg>
            </div>
        ),
        { ...size }
    )
}
