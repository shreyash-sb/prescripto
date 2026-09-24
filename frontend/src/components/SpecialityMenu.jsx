import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
    return (
        <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900'>Find by Speciality</h1>
            <p className='max-w-md text-center text-base sm:text-lg text-gray-600'>Browse through our extensive list of trusted specialists and schedule your consultation hassle-free.</p>
            <div className='flex sm:justify-center gap-6 pt-6 w-full overflow-x-auto pb-2 custom-scrollbar'>
                {
                    specialityData.map((item, index) => (
                        <Link onClick={()=>scrollTo(0,0)} className='flex flex-col items-center text-sm sm:text-base font-semibold text-gray-700 cursor-pointer flex-shrink-0 hover:translate-y-[-8px] hover:text-primary transition-all duration-300' key={index} to={`/doctors/${item.speciality}`}>
                            <img src={item.image} className='w-20 sm:w-28 mb-3 drop-shadow-sm' alt={item.speciality} />
                            <p>{item.speciality}</p>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default SpecialityMenu
