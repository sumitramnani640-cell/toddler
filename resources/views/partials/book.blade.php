<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Book A Tour</title>
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
    <img src="assets/g6.jpg" alt="Hero Banner" class="w-full h-full object-cover object-bottom" />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>

    <!-- Text & Button -->
    <div class="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 z-10 text-white">
      <h2 class="font-normal text-2xl sm:text-[40px] leading-tight tracking-normal mb-4" style="font-family: 'Mochiy Pop One', sans-serif;">
       Book A Tour
      </h2>

      <p class="font-happy font-normal text-lg sm:text-[30px] leading-snug tracking-normal">
    Our Blossom family strives to deliver the very best for your little one, and your family
      </p>
    </div>
  </div>
</section>

<section class=" py-12 text-center w-full mx-auto px-4 py-8">


  <!-- Breadcrumb -->
  <nav class="flex mb-6 px-2 sm:px-10">
    <ol class="inline-flex flex-wrap items-center space-x-1 text-sm sm:text-base">
      <li>
        <a href="/" class="font-happy text-gray-600 hover:underline text-base sm:text-[20px]">Home</a>
      </li>
      <li><span class="px-1 font-happy text-gray-600 text-base sm:text-[20px]">/</span></li>
      <li>
        <span class="font-happy text-gray-800 text-base sm:text-[20px]">Book A Tour</span>
      </li>
    </ol>
  </nav>
  <!-- Title -->
  <h2 class="text-2xl sm:text-3xl  text-gray-900 mb-2" style="font-family: 'Mochiy Pop One', sans-serif;">Book A Tour</h2>
  <p class="text-gray-700 text-base sm:text-lg md:text-xl  mb-10 font-happy"> Our Blossom family strives to deliver the very best for your little one, and your family</p>


<div class="bg-[#FFF4E5] py-12 px-4 sm:px-6 lg:px-8 font-happy mx-4 sm:mx-6 lg:mx-10">


  <!-- Form Box -->
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-10">
 <h2 class="text-black mb-4 text-lg sm:text-xl text-center md:text-left"
          style="font-family: 'Mochiy Pop One', sans-serif;">
        PLEASE PROVIDE YOUR DETAILS BELOW
      </h2>

      <form action="" method="POST" class="space-y-6 text-left">

        <!-- Parent Full Name -->
        <div>
          <label class="block font-medium mb-1 font-happy">Parent Full Name <span class="text-red-500">*</span></label>
          <input type="text" name="parent_name" required
                 class="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-yellow-200 font-happy" />
        </div>

        <!-- Email & Phone -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium mb-1 font-happy">Email <span class="text-red-500">*</span></label>
            <input type="email" name="email" required
                   class="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-yellow-200 font-happy" />
          </div>
        <div>
          <label class="block font-medium mb-1 font-happy">Phone Number <span class="text-red-500">*</span></label>
          <div class="flex">
            <select name="phone_country" required
                    class="border border-gray-300 rounded-l px-3 py-2 bg-white font-happy">
              <option value="UAE">UAE</option>
              <!-- more options as needed -->
            </select>
            <span class="inline-flex items-center border-t border-b border-gray-300 px-2 bg-gray-100 font-happy">+971</span>
            <input type="tel" name="phone_number" required
                   class="w-full border border-gray-300 rounded-r px-4 py-2 focus:ring focus:ring-yellow-200 font-happy"/>
          </div>
        </div>
        </div>

        <!-- Child Full Name & DOB -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium mb-1 font-happy">Child Full Name <span class="text-red-500">*</span></label>
            <input type="text" name="child_name" required
                   class="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-yellow-200 font-happy" />
          </div>
          <div>
            <label class="block font-medium mb-1 font-happy">Date Of Birth <span class="text-red-500">*</span></label>
            <input type="date" name="child_dob" required
                   class="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-yellow-200 font-happy" />
          </div>
        </div>

        <!-- Select Date & Time -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium mb-1 font-happy">Select Date <span class="text-red-500">*</span></label>
            <input type="date" name="tour_date" required
                   class="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-yellow-200 font-happy" />
          </div>
          <div class="relative">
            <label class="block font-medium mb-1 font-happy">Select Time <span class="text-red-500">*</span></label>
            <select name="tour_time" required
                    class="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:ring focus:ring-yellow-200 font-happy appearance-none">
              <option disabled selected>Select time</option>
              <option>12:00 PM to 2:00 PM</option>
              <option>2:00 PM to 4:00 PM</option>
              <option>4:00 PM to 6:00 PM</option>
            </select>
            <!-- Custom clock icon -->
            <img src="assets/icons/time.png" alt="Clock Icon"
                 class="w-4 h-4 absolute right-5 top-3/4 transform -translate-y-3/4 pointer-events-none" />
          </div>
        </div>

        <!-- reCAPTCHA placeholder -->
        <div>
          <label class="block text-sm font-medium text-gray-700 font-happy">Captcha Code</label>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-1">
            <span id="generated-captcha"
                  class="px-4 py-2 bg-gray-200 rounded text-lg font-mono">A8F9K</span>
            <button type="button" onclick="generateCaptcha()"
                    class="text-blue-600 text-sm font-happy">Refresh</button>
          </div>
          <input id="user-captcha" type="text" placeholder="Enter Code"
                 class="mt-2 block w-full border border-gray-300 rounded-md p-2 font-happy" required />
          <p id="captcha-error" class="text-red-500 text-sm hidden mt-1 font-happy">Incorrect captcha.</p>
        </div>

        <!-- Privacy Notice -->
        <p class="text-xs text-gray-600 font-happy">
          toddlersintlnursery.com needs the contact information you provide to us to contact you about our products and services.
          You may unsubscribe from these communications at anytime. For information on how to unsubscribe, as well as our privacy
          practices and commitment to protecting your privacy, check out our Privacy Policy.
        </p>

        <!-- Submit Button -->
        <button type="submit"
                class="bg-[#F8CF05] text-black px-10 py-3 text-lg rounded-full font-bold hover:brightness-110 transition font-happy w-full sm:w-auto">
          BOOK YOUR TOUR TODAY
        </button>
      </form>
    </div>

</div>
</section>

 @include('partials.footer')

 <!-- JavaScript for Captcha -->
<script>
  let currentCaptcha = '';

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('generated-captcha').textContent = code;
    currentCaptcha = code;
  }

  function validateCaptcha(event) {
    const input = document.getElementById('user-captcha').value.trim();
    const error = document.getElementById('captcha-error');

    if (input.toUpperCase() !== currentCaptcha) {
      error.classList.remove('hidden');
      event.preventDefault();
      return false;
    } else {
      error.classList.add('hidden');
      return true;
    }
  }

  // Generate captcha on page load
  window.onload = generateCaptcha;
</script>