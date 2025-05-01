import React, { useState } from 'react';
import { advisors } from './data/Advisors';

const Advisor = () => {
    const [isHovered, setisHovered] = useState(false);

    const ToggleImageOn = () => {
        setisHovered(!isHovered);
    }

    const ToggleImageOff = () => {
        setisHovered(false);
    }

    return (  
        <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onMouseEnter={ToggleImageOn} onMouseLeave={ToggleImageOff} className="bg-white rounded shadow hover:shadow-lg transition h-100 w-80 flex flex-col justify-center relative">
                    <img src="/jesus_christ.webp" alt="image of Jesus Christ" className={`tansition-all 300 ${isHovered ? 'opacity-40' : 'opacity-100'} w-full h-full rounded`}/>
                    <div className={`transition-all 300 ${isHovered ? 'opacity-100' : 'opacity-0'} absolute left-0 flex flex-col justify-between h-96`}>
                        <h2 className="font-bold text-xl">Jesus Christ</h2>
                        <p>Known as the Messiah, He was a profound moral teacher, a symbol of existential hope, and a subject of metaphysical inquiry.</p>
                    </div>
                </div>
            </section>
        </>
    );
}
 
export default Advisor;