<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gallery</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
 
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap" rel="stylesheet">

</head>

      @include('partials.header')
<body class="">


<section class="relative w-full overflow-hidden bg-white">
  <div class="relative w-full" style="aspect-ratio: 1920/850;">
    <!-- Banner Image -->
    <img src="assets/img8.webp" alt="Hero Banner" class="w-full h-full object-cover object-top" />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>

    <!-- Text & Button -->
    <div class="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 z-10 text-white">
      <h2 class="font-normal text-2xl sm:text-[40px] leading-tight tracking-normal mb-4" style="font-family: 'Mochiy Pop One', sans-serif;">
        Our Gallery
      </h2>

      <p class="font-happy font-normal text-lg sm:text-[30px] leading-snug tracking-normal">
      A Rich, Holistic, Educational, And Fun Experience Every Single Day
      </p>
    </div>
  </div>
</section>



<!---------------------------------------------------------- gallery----------------------------------------------------------------------->
<section class=" py-12 px-6 sm:px-12 lg:px-20 text-center">

  <!-- Breadcrumb -->
  <nav class="flex mb-6 px-2 sm:px-10">
    <ol class="inline-flex flex-wrap items-center space-x-1 text-sm sm:text-base">
      <li>
        <a href="/" class="font-happy text-gray-600 hover:underline text-base sm:text-[20px]">Home</a>
      </li>
      <li><span class="px-1 font-happy text-gray-600 text-base sm:text-[20px]">/</span></li>
      <li>
        <span class="font-happy text-gray-800 text-base sm:text-[20px]">Our Gallery</span>
      </li>
    </ol>
  </nav>

  <!-- Title -->
  <h2 class="text-2xl sm:text-3xl  text-gray-900 mb-2" style="font-family: 'Mochiy Pop One', sans-serif;">Our Gallery</h2>
  <p class="text-gray-700 text-base sm:text-lg md:text-xl  mb-10 font-happy"> A Rich, Holistic, Educational, And Fun Experience Every Single Day</p>

  <!-- Image Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <!-- First Row -->
    <div class="md:col-span-1 md:row-span-1 md:col-start-1">
      <img src="assets/g1.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 1" />
    </div>
    <div>
      <img src="assets/g2.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 2" />
    </div>
    <div>
      <img src="assets/g3.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 3" />
    </div>

    <!-- Second Row -->
    <div>
      <img src="assets/g4.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 4" />
    </div>
    <div>
      <img src="assets/g5.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 5" />
    </div>
    <div class="md:col-span-1 md:col-start-3">
      <img src="assets/g7.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 6" />
    </div>

    <!-- Third Row -->
    <div class="md:col-span-1 md:row-span-1 md:col-start-1">
      <img src="assets/g1.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 1" />
    </div>
    <div>
      <img src="assets/g2.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 2" />
    </div>
    <div>
      <img src="assets/g3.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 3" />
    </div>

    <!-- fourth Row -->
    <div>
      <img src="assets/g4.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 4" />
    </div>
    <div>
      <img src="assets/g5.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 5" />
    </div>
    <div class="md:col-span-1 md:col-start-3">
      <img src="assets/g7.webp" class="w-full h-[388px] object-cover rounded-md shadow-md" alt="Image 6" />
    </div>
  </div>


</section>

<img src="/assets/wavy.svg" alt="Wavy Line" class="w-full h-auto mb-8">





<!----------------------------------------------------------------form--------------------------------------------------------------------------- -->




  @include('components.form')

    <!-- -----------------------------------------------footer------------------------------------------------------------  -->

    @include('partials.footer')


</body>
</html>
