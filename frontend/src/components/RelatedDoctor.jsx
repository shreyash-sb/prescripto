import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import DoctorIdentity from './DoctorIdentity'

const RelatedDoctor = ({ speciality, docId }) => {
    const { doctors } = useContext(AppContext)
    const navigate = useNavigate()
    const [relDoc, setRelDoc] = useState([])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
            setRelDoc(doctorsData)  
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Related Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm text-gray-500'>Explore other certified specialists in {speciality}</p>
            <div className='w-full grid grid-cols-auto gap-5 pt-5 gap-y-6 px-3 sm:px-0'>
                {
                    relDoc.slice(0, 5).map((item, index) => (
                        <div onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0)}} key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                            <DoctorIdentity
                                name={item.name}
                                speciality={item.speciality}
                                docId={item._id}
                                degree={item.degree}
                            />
                            <div className='p-4'>
                                <div className={`flex items-center gap-1.5 text-xs font-semibold ${item.available ? 'text-emerald-600' : 'text-rose-500' } `}>
                                    <span className={`w-2 h-2 ${item.available ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} />
                                    <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                </div>
                                <p className='text-gray-900 text-base font-bold mt-1'>{item.name}</p>
                                <p className='text-primary text-xs font-medium'>{item.speciality}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0,0) }} className='bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold px-12 py-3 rounded-full mt-10 transition-colors shadow-sm'>
                View All Doctors →
            </button>
        </div>
    )
}

export default RelatedDoctor
