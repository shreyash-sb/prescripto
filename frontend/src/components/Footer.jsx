import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-32 text-base'>
                <div>  {/* Left part */}
                    <img className='mb-5 w-48' src={assets.logo} alt="Prescripto Healthcare" />
                    <p className='w-full md:w-4/5 text-gray-600 leading-relaxed text-base'>
                        Prescripto is an advanced healthcare appointment and clinical consultation platform connecting patients with top-rated medical specialists, instant slot bookings, digital prescriptions, and secure records management.
                    </p>
                </div>

                <div>  {/* Center part */}
                    <p className='text-lg font-bold text-gray-900 mb-5 tracking-wide'>COMPANY</p>
                    <ul className='flex flex-col gap-3 text-base text-gray-600'>
                        <li className='hover:text-primary cursor-pointer transition-colors'>Home</li>
                        <li className='hover:text-primary cursor-pointer transition-colors'>About us</li>
                        <li className='hover:text-primary cursor-pointer transition-colors'>All Doctors</li>
                        <li className='hover:text-primary cursor-pointer transition-colors'>Privacy Policy</li>
                    </ul>
                </div>

                <div>  {/* Right part */}
                    <p className='text-lg font-bold text-gray-900 mb-5 tracking-wide'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-3 text-base text-gray-600'>
                        <li className='font-medium text-gray-800'>📞 +1 (800) 555-DOCS</li>
                        <li className='font-medium text-gray-800'>✉️ support@prescripto-health.com</li>
                        <li className='text-sm text-gray-400 mt-1'>24/7 Dedicated Medical Support</li>
                    </ul>
                </div>
            </div>
            <div>
                <hr className='border-gray-200' />
                <p className='py-6 text-base text-center text-gray-500'> &#169; Copyright {new Date().getFullYear()} Prescripto - All Rights Reserved</p>
            </div>
        </div>
    )
}

export default Footer
