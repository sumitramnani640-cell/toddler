<section class="relative bg-cover bg-center py-16" style="background-image: url('assets/img6.webp');">

  <!-- Blur Overlay -->
  <div class="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

  <!-- Main Content -->
  <div class="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 px-4 sm:px-6">
    
    <!-- Left Paragraph -->
    <div class="md:w-1/2 w-full text-black text-center md:text-left">
      <p class="text-[24px] sm:text-[32px] md:text-[40px] leading-[150%] tracking-[0] max-w-xl mx-auto md:mx-0"
         style="font-family: 'Mochiy Pop One', sans-serif; font-weight: 400;">
        Empowering young minds <br> in a safe, nurturing, <br> and stimulating environment. <br>
        Come see how our dedicated educators and engaging spaces <br>help your child thrive.
      </p>
    </div>

    <!-- Right Form -->
    <div class="md:w-1/2 w-full bg-white shadow-lg rounded-lg p-4 sm:p-6">
      <h2 class="text-black mb-4 text-lg sm:text-xl text-center md:text-left"
          style="font-family: 'Mochiy Pop One', sans-serif;">
        PLEASE PROVIDE YOUR DETAILS BELOW
      </h2>

      <form action="" method="POST" class="space-y-6">

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