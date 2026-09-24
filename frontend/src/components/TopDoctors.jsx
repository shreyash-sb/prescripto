import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorIdentity from './DoctorIdentity'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900'>Top Doctors to Book</h1>
            <p className='max-w-md text-center text-base sm:text-lg text-gray-600'>Browse through our certified network of medical specialists</p>
            <div className='w-full grid grid-cols-auto gap-6 pt-6 gap-y-7 px-3 sm:px-0'>
                {
                    doctors.slice(0, 10).map((item, index) => (
                        <div onClick={()=>navigate(`/appointment/${item._id}`)} key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                            <DoctorIdentity
                                name={item.name}
                                speciality={item.speciality}
                                docId={item._id}
                                degree={item.degree}
                            />
                            <div className='p-5'>
                                <div className={`flex items-center gap-2 text-sm font-semibold ${item.available ? 'text-emerald-600' : 'text-rose-500' } `}>
                                    <span className={`w-2.5 h-2.5 ${item.available ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} />
                                    <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                </div>
                                <p className='text-gray-900 text-lg font-bold mt-1.5 leading-snug'>{item.name}</p>
                                <p className='text-primary text-sm font-semibold mt-0.5'>{item.speciality}</p>
                                <p className='text-gray-400 text-xs mt-1'>{item.degree}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <button onClick={()=> {navigate('/doctors'); scrollTo(0,0)}} className='bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-base px-12 py-3.5 rounded-full mt-10 transition-all shadow-sm active:scale-95'>
                View All Doctors →
            </button>
        </div>
    )
}

export default TopDoctors
