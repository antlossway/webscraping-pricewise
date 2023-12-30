"use client"
// because there is interactivity

import React from "react"
import "react-responsive-carousel/lib/styles/carousel.min.css" // requires a loader
import { Carousel } from "react-responsive-carousel"
import Image from "next/image"

const heroImages = [
  {
    imgUrl: "/assets/images/hero-1.svg",
    alt: "smart watch",
  },
  {
    imgUrl: "/assets/images/hero-2.svg",
    alt: "bag",
  },
  {
    imgUrl: "/assets/images/hero-3.svg",
    alt: "lamp",
  },
  {
    imgUrl: "/assets/images/hero-4.svg",
    alt: "air fryer",
  },
  {
    imgUrl: "/assets/images/hero-5.svg",
    alt: "chair",
  },
]

const HeroCarousel = () => {
  return (
    <div className="hero-carousel">
      <Carousel
        showThumbs={false}
        autoPlay={false}
        infiniteLoop={false}
        interval={2000}
        showArrows={false}
        showStatus={false}
      >
        {heroImages.map((image) => (
          <Image
            key={image.alt}
            src={image.imgUrl}
            alt={image.alt}
            width={484}
            height={484}
            className="object-contain"
          />
        ))}
      </Carousel>

      <Image
        src="/assets/icons/hand-drawn-arrow.svg"
        alt="arrow-left"
        width={175}
        height={175}
        className="max-xl:hidden absolute bottom-0 -left-[15%]"
      />
    </div>
  )
}

export default HeroCarousel
