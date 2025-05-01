import React, { useState } from 'react';

const Advisor = () => {
    const [isHovered, setisHovered] = useState(false);

    const ToggleImage = () => {
        setisHovered(!isHovered);
    }

    return (  
        <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <article className="bg-white rounded-full shadow p-4 hover:shadow-lg transition h-80 w-80 flex flex-col justify-center">
                    <img src="" alt="image of Jesus Christ" className=""/>
                    <h2 className="font-bold">Jesus Christ</h2>
                    <p>Known as the Messiah, he came to save the world from sin</p>
                </article>
            </section>
        </>
    );
}
 
export default Advisor;