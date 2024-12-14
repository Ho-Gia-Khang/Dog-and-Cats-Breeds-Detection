import React from 'react'

const Divider = ({ vertical = false }: { vertical?: boolean }) => {
  return (
    <>
      {vertical ? (
        <div className="w-0 h-full mx-2 bg-black border-black border-r-2"></div>
      ) : (
        <div className="w-full h-0 my-3 bg-black border-black border-b-2"></div>
      )}
    </>
  )
}

export default Divider
