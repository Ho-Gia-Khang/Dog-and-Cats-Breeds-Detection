import React from 'react'

const Button = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <button
      className="h-10 w-24 bg-[#008080] rounded-md text-white"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default Button
