import React from 'react'
import logo from "../assets/logo1.png";

function Logo({ width = '80px' }) {
  return (
    <div>
      <img src={logo} alt="DevUI Logo" style={{ width: width, borderRadius: '90%' }} />
    </div>
  )
}

export default Logo