<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Toddler website</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Happy+Monkey&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap" rel="stylesheet">
  <style>
    .font-happy {
      font-family: 'Happy Monkey', cursive;
    }
  </style>
  <script>
    function toggleMobileMenu() {
      document.getElementById('mobile-menu-wrapper').classList.toggle('hidden');
    }
  </script>
</head>

<body>

  <!-- Top Mobile Bar: Logo (left) + Hamburger (right) -->
  <div class="lg:hidden bg-gradient-to-r from-white to-yellow-50 py-3 px-6 flex items-center justify-between relative z-20">
    <a href="/">
      <img src="assets/logo.png" alt="Logo" class="h-12" />
    </a>
    <button onclick="toggleMobileMenu()" class="text-[#055DA9] text-2xl">
      <i class="fas fa-bars"></i>
    </button>
  </div>

  <!-- Mobile Menu Panel -->
  <div id="mobile-menu-wrapper" class="lg:hidden hidden bg-white border-b font-happy px-6 pb-4 space-y-2">
    <!-- Top Navbar Links -->
    <div class="pt-2 space-y-2">
      <a href="#" class="block text-gray-800">About Us</a>
      <a href="#" class="block text-gray-800">Contact Us</a>
      <a href="#" class="block text-gray-800">Careers</a>
      <a href="book" class="block border border-[#055DA9] text-[#055DA9] px-4 py-2 rounded-full text-center">Book A Tour</a>
    </div>
    <hr>
    <!-- Bottom Navbar Links -->
    <div class="space-y-2">
      <a href="/" class="block text-gray-800">Home</a>
      <a href="curriculum" class="block text-gray-800">Our Curriculum</a>
      <a href="gallery" class="block text-gray-800">Gallery</a>
      <a href="calendar" class="block text-gray-800">Calendar</a>
      <a href="#" class="block text-gray-800">Download Forms</a>
      <a href="#" class="block text-gray-800">Newsletters</a>
    </div>
  </div>

  <!-- Desktop Top Navbar -->
  <div class="hidden lg:flex bg-gradient-to-r from-white to-yellow-50 py-3 relative z-10 font-happy">
    <div class="w-full px-6 mx-auto flex justify-end items-center gap-5 text-m text-gray-700">
      <a href="#" class="border border-[#055DA9] w-10 h-10 flex items-center justify-center rounded hover:bg-blue-50">
        <i class="fa-solid fa-phone" style="color: #055DA9;"></i>
      </a>
      <a href="#" class="border border-[#055DA9] w-10 h-10 flex items-center justify-center rounded hover:bg-blue-50">
        <i class="fa-solid fa-envelope" style="color: #055DA9;"></i>
      </a>
      <a href="#" class="hover:underline text-gray-800">About Us</a>
      <a href="#" class="hover:underline text-gray-800">Contact Us</a>
      <a href="#" class="hover:underline text-gray-800">Careers</a>
      <a href="book" class="border border-[#055DA9] text-[#055DA9] px-4 py-2 rounded-full hover:bg-blue-50">Book A Tour</a>
    </div>
  </div>

  <!-- Floating Logo (Desktop Only) -->
  <div class="hidden lg:flex relative z-20 -mt-14 mb-[-3rem] pointer-events-none p-2">
    <div class="w-full px-6 mx-auto flex justify-start">
      <a href="/"><img src="assets/logo.png" alt="Logo" class="h-24 px-4 py-2 pointer-events-auto" /></a>
    </div>
  </div>

  <!-- Desktop Bottom Navbar -->
  <div class="hidden lg:flex bg-white relative z-10 border-b font-happy">
    <div class="w-full px-6 mx-auto flex justify-end gap-6 py-3 text-m text-gray-800">
      <a href="/" class="hover:text-[#055DA9] {{ request()->is('/') ? 'text-[#055DA9] underline' : 'text-gray-800' }}">Home</a>
      <a href="curriculum" class="hover:text-[#055DA9] {{ request()->is('curriculum') ? 'text-[#055DA9] underline' : 'text-gray-800' }}">Our Curriculum</a>
      <a href="gallery" class="hover:text-[#055DA9] {{ request()->is('#') ? 'text-[#055DA9] hover:underline' : 'text-gray-800' }}">Gallery</a>
      <a href="calendar" class="hover:text-[#055DA9] {{ request()->is('#') ? 'text-[#055DA9] hover:underline' : 'text-gray-800' }}">Calendar</a>
      <a href="#" class="hover:text-[#055DA9] {{ request()->is('#') ? 'text-[#055DA9] hover:underline' : 'text-gray-800' }}">Download Forms</a>
      <a href="#" class="hover:text-[#055DA9] {{ request()->is('#') ? 'text-[#055DA9] hover:underline' : 'text-gray-800' }}">Newsletters</a>
    </div>
  </div>

</body>
</html>
