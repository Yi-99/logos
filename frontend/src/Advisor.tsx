import React, { useState } from "react";
import { advisors } from "./data/Advisors";

const Advisor = () => {
  const [hoveredId, setHoveredId] = useState(-1);

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
        {advisors.map((advisor) => (
          <div
            onMouseEnter={() => setHoveredId(advisor.id)}
            onMouseLeave={() => setHoveredId(-1)}
            className="bg-white rounded shadow hover:shadow-lg transition h-100 w-80 flex flex-col justify-center relative"
          >
            <img
              src={advisor.image}
              alt={advisor.image_description}
              className={`transition-all 300 ${
                hoveredId === advisor.id ? "opacity-40" : "opacity-100"
              } w-full h-full rounded`}
            />
            <div
              className={`transition-all 300 ${
                hoveredId === advisor.id ? "opacity-100" : "opacity-0"
              } absolute left-0 flex flex-col justify-between h-96`}
            >
              <h2 className="font-bold text-xl">{advisor.name}</h2>
              <p className="font-bold p-4">{advisor.description}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default Advisor;
