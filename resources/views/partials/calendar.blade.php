<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Calendar</title>
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
    <img src="assets/img11.jpg" alt="Hero Banner" class="w-full h-full object-cover object-top" />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>

    <!-- Text & Button -->
    <div class="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 z-10 text-white">
      <h2 class="font-normal text-2xl sm:text-[40px] leading-tight tracking-normal mb-4" style="font-family: 'Mochiy Pop One', sans-serif;">
        Calendar
      </h2>

      <p class="font-happy font-normal text-lg sm:text-[30px] leading-snug tracking-normal">
     We provide the flexibility and convenience that working parents love.
      </p>
    </div>
  </div>
</section>



<!---------------------------------------------------------- calendar----------------------------------------------------------------------->
<section class=" py-12 text-center">


  <!-- Breadcrumb -->
  <nav class="flex mb-6 px-2 sm:px-10">
    <ol class="inline-flex flex-wrap items-center space-x-1 text-sm sm:text-base">
      <li>
        <a href="/" class="font-happy text-gray-600 hover:underline text-base sm:text-[20px]">Home</a>
      </li>
      <li><span class="px-1 font-happy text-gray-600 text-base sm:text-[20px]">/</span></li>
      <li>
        <span class="font-happy text-gray-800 text-base sm:text-[20px]">Calendar</span>
      </li>
    </ol>
  </nav>

  <!-- Title -->
  <h2 class="text-2xl sm:text-3xl  text-gray-900 mb-2" style="font-family: 'Mochiy Pop One', sans-serif;">Calendar</h2>
  <p class="text-gray-700 text-base sm:text-lg md:text-xl  mb-10 font-happy">We provide the flexibility and convenience that working parents love.</p>

  <img src="/assets/wavy.svg" alt="Wavy Line" class="w-full h-auto mb-8">

  <div class="w-full mx-auto bg-white p-4 px-10">
  <h2 class="text-xl font-normal text-[#055DA9] mb-4 font-happy text-left">Term 1 (June 2025 – September 2025)</h2>

  <div class="w-full border border-gray-300 font-happy text-[#055DA9] text-[20px]">
    <!-- Row -->
    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Sunday 1st June</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Staff Returns–Set up.</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Monday 2nd June</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">First Day of School for Returning Children</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Saturday 7th June</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Parents ‘Orientation Day</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Sunday 8th June</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">First Day of School for New children</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Saturday 30th June</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Summer club</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Sunday 6th July</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">Lorem ipsum</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Thursday 10th July</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Dummy text</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Sunday 13th July</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">Lorem ipsum</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Saturday 2nd August</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Parents ‘Orientation Day</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Monday 1st September</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">Staff Returns–Set up.</div>
    </div>
  </div>
</div>

  <img src="/assets/wavy.svg" alt="Wavy Line" class="w-full h-auto mb-8">

  <div class="w-full mx-auto bg-white p-4 px-10 ">
  <h2 class="text-xl font-normal text-[#055DA9] mb-4 font-happy text-left">Term 2 (October 2025 – December 2025)</h2>

  <div class="w-full border border-gray-300 font-happy text-[#055DA9] text-[20px]">
    <!-- Row -->
    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Sunday 1st June</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Staff Returns–Set up.</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Monday 2nd June</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">First Day of School for Returning Children</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Saturday 7th June</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Parents ‘Orientation Day</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Sunday 8th June</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">First Day of School for New children</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Saturday 30th June</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Summer club</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Sunday 6th July</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">Lorem ipsum</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Thursday 10th July</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Dummy text</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Sunday 13th July</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">Lorem ipsum</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#E1F5FE] px-4 py-4 font-normal text-center">Saturday 2nd August</div>
      <div class="bg-[#E1F5FE] px-4 py-4 text-center border-l-2 border-white">Parents ‘Orientation Day</div>
    </div>

    <div class="grid grid-cols-2">
      <div class="bg-[#B3E5FC] px-4 py-4 font-normal text-center">Monday 1st September</div>
      <div class="bg-[#B3E5FC] px-4 py-4 text-center border-l-2 border-white">Staff Returns–Set up.</div>
    </div>
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
