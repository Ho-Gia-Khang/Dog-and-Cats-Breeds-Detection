import React from 'react'

const Image = ({
  src,
  width = 60,
  height = 60,
}: {
  src: string
  width?: number
  height?: number
}) => {
  return <img src={src} alt="image" width={width} height={height} />
}

export default Image
