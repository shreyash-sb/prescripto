import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-3xl pt-10 text-gray-500 font-bold'>
        <p>CONTACT <span className='text-gray-900'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-12 mb-28 text-base'>
        <img className='w-full md:max-w-[400px] rounded-3xl shadow-lg' src={assets.contact_image} alt="Contact Prescripto" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-bold text-xl text-gray-900'>OUR HEADQUARTERS</p>
          <p className='text-gray-600 leading-relaxed text-base'>
            742 Evergreen Medical Parkway <br />
            Suite 500, Innovation District <br />
            New York, NY 10001
          </p>
          <p className='text-gray-600 leading-relaxed text-base'>
            <strong>Toll Free:</strong> +1 (800) 555-DOCS <br />
            <strong>Direct:</strong> +1 (212) 555-0199 <br />
            <strong>Support Email:</strong> support@prescripto-health.com
          </p>
          <p className='font-bold text-xl text-gray-900 mt-2'>CAREERS AT PRESCRIPTO</p>
          <p className='text-gray-600 text-base'>Learn more about our clinical teams, engineering openings, and healthcare mission.</p>
          <button className='border-2 border-primary text-primary font-bold px-9 py-4 text-base rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95'>
            Explore Careers & Positions
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact
