import React from 'react'

const Image = ({
  src,
  width = 100,
  height = 100,
}: {
  src: string
  width?: number
  height?: number
}) => {
  return (
    <img
      src={src}
      alt={src}
      width={width}
      height={height}
      className="object-contain"
    />
  )
}

export default Image
