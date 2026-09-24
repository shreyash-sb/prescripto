import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-3xl pt-10 text-gray-500 font-bold'>
        <p>ABOUT <span className='text-gray-900'>US</span></p>
      </div>
      <div className='my-10 flex flex-col sm:flex-row gap-12 items-center'>
        <img className='w-full md:max-w-[400px] rounded-3xl shadow-lg' src={assets.about_image} alt="About Prescripto" />
        <div className='flex flex-col justify-center gap-6 md:w-3/5 text-base text-gray-700 leading-relaxed'>
          <p>
            Welcome to <strong className='text-gray-900 font-bold'>Prescripto</strong>, your modern healthcare partner designed to bridge the gap between patients, medical specialists, and hospital administrations. We simplify finding top-rated doctors, booking verified appointment slots, managing digital health records, and receiving clinical prescriptions seamlessly.
          </p>
          <p>
            Prescripto is engineered with cutting-edge full-stack technologies to ensure maximum security, responsiveness, and reliability. Whether you are scheduling your first consultation, consulting with a specialist, or tracking past medical treatments, our platform provides a friction-free healthcare journey.
          </p>
          <b className='text-gray-900 text-lg font-bold'>Our Mission & Vision</b>
          <p>
            Our mission is to democratize healthcare access by providing an intuitive, transparent, and patient-first digital ecosystem. We empower doctors with streamlined clinical workflows and enable patients to take charge of their health anytime, anywhere.
          </p>
        </div>
      </div>
      <div className='text-2xl my-8 font-bold'>
        <b>WHY <span className='text-primary'>CHOOSE US</span></b>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-20'>
        <div className='border border-gray-200 rounded-3xl p-8 flex flex-col gap-4 hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer shadow-sm hover:shadow-xl group'>
          <b className='text-xl group-hover:text-white text-gray-900'>⚡ Peak Efficiency</b>
          <p className='leading-relaxed text-base'>
            Streamlined 7-day appointment scheduling that fits dynamically into your busy schedule with real-time slot conflict prevention.
          </p>
        </div>
        <div className='border border-gray-200 rounded-3xl p-8 flex flex-col gap-4 hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer shadow-sm hover:shadow-xl group'>
          <b className='text-xl group-hover:text-white text-gray-900'>🏥 Verified Specialists</b>
          <p className='leading-relaxed text-base'>
            Direct access to verified healthcare professionals across 6+ specialized disciplines, with complete transparency in fees and reviews.
          </p>
        </div>
        <div className='border border-gray-200 rounded-3xl p-8 flex flex-col gap-4 hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer shadow-sm hover:shadow-xl group'>
          <b className='text-xl group-hover:text-white text-gray-900'>📋 Digital Health Records</b>
          <p className='leading-relaxed text-base'>
            Secure access to digital prescriptions, doctor clinical notes, instant invoice downloads, and automated appointment reminders.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
