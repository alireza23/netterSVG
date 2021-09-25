var image = $("#Layer_2_xA0_Image");
var image2 = $("#Layer_3_xA0_Image");
var image3 = $("#Layer_4_xA0_Image");
var image4 = $("#Layer_5_xA0_Image");
var image5 = $("#Layer_6_xA0_Image");
var image6 = $("#Layer_7_xA0_Image");
var image7 = $("#Layer_12_xA0_Image");
var image8 = $("#Layer_8_xA0_Image");
var tl = gsap.timeline();
var duration = 0.2;
tl.from(image, { y: 450, x: 520, duration: duration })
  .from(image2, { y: 450, x: 520, duration: duration })
  .from(image3, { y: 450, x: 520, duration: duration })
  .from(image4, { y: 450, x: 520, duration: duration })
  .from(image5, { y: 450, x: 520, duration: duration })
  .from(image6, { y: 450, x: 520, duration: duration })
  .from(image7, {opacity: 0, transformOrigin: "37% 55%",rotation: 40,duration: 1.2,ease: "easeOut",})
  .from(image8,{ y: 450, x: 520, duration: duration })

// animate(image, 450, .8);
// animate(image2, 450, .8);
// animate(image3, 450, .8);
// animate(image4, 450,.8);
// animate(image5, 450,.8);
// animate(image6, 450,.8);

// gsap.from(image7, {
//     transformOrigin:"37% 55%",
//     rotation:100,
//     duration: 1.5,
//     ease: "Bounce.easeOut"
//   });
// function animate(obj, y, duration) {
//   gsap.from(obj, {
//     y:y,
//     x: 120,
//     duration: duration,
//   });
// }
