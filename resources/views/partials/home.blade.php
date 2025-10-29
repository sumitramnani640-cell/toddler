<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Home page</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Happy+Monkey&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .font-happy {
      font-family: 'Happy Monkey', cursive;
    }
  </style>
</head>

<body>
  <section class="relative w-full overflow-hidden bg-white">

    <!-- Banner Section -->
    <div class="relative w-full" style="aspect-ratio: 1920/850;">
      <!-- Banner Image -->
      <img src="assets/banner.webp" alt="Hero Banner" class="w-full h-full object-cover object-top" />

      <!-- Book a Tour Button -->
      <div class="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-10 sm:bottom-20">
        <button class="bg-[#F8CF05] text-black font-happy font-bold hover:brightness-110 transition px-6 sm:px-14 py-2 sm:py-4 text-sm sm:text-lg rounded-full">
          BOOK A TOUR
        </button>
      </div>
    </div>

    <!-- Fixed Floating Bubble -->
    <div class="fixed top-1/3 right-0 z-50 bg-white  shadow-lg p-4 space-y-4 w-30 text-center text-sm hidden sm:block">
      
      <!-- Location -->
      <div class="flex flex-col items-center space-y-1">
        <i class="fa-solid fa-paper-plane" style="color: #055DA9;"></i>
        <a href=""><span class="font-happy">Location</span></a>
      </div>
      <hr>

      <!-- Contact -->
      <div class="flex flex-col items-center space-y-1">
        <i class="fa-solid fa-phone" style="color: #055DA9;"></i>
        <a href=""><span class="font-happy">Contact Us</span></a>
      </div>
      <hr>

      <!-- Mail -->
      <div class="flex flex-col items-center space-y-1">
        <i class="fa-solid fa-envelope" style="color: #055DA9;"></i>
        <a href=""><span class="font-happy">Mail Us</span></a>
      </div>
      <hr>

      <!-- Book A Tour -->
      <div class="flex flex-col items-center space-y-1">
        <i class="fa-solid fa-person" style="color: #055DA9;"></i>
        <a href=""><span class="font-happy">Book A Tour</span></a>
      </div>
      <hr>

      <!-- Hide Button -->
      <button class=" hover:underline font-happy text-[#C837AB]">Hide ></button>
    </div>

  </section>



<!----------------------------------------------------- welcome to toddlers ---------------------------------------------------------------------------->

<section class="bg-[#FFFAF0] py-10">
  <div class="w-full flex flex-col md:flex-row gap-10 px-4 sm:px-8 lg:px-12 xl:px-16">

    <!-- Left Text (No horizontal center) -->
<div class="md:w-[55%] w-full flex flex-col justify-center px-4 sm:px-10">
  <h2 class="text-2xl sm:text-3xl md:text-4xl text-gray-900 leading-[150%] mb-8 text-center md:text-left"
      style="font-family: 'Mochiy Pop One', sans-serif;">
    Welcome to Toddlers International <br class="hidden sm:block">Nursery!
  </h2>

  <div class="w-full text-center md:text-left space-y-6 prose prose-gray font-happy mb-10">
    <p>
      Since 2009, Toddlers International Nursery is committed to providing a secure and stimulating Early Years Education experience for young children. We foster a carefully prepared environment which takes into account each child’s individual needs in order to grant children with a ‘home away from home’ – a place where they can develop to their utmost individual potential and at their own pace.
    </p>
    <p> 
      Guided by the principle of “nurturing with love, inspiring through learning”, Toddlers International Nursery aims to promote children’s growth and development by providing young learners with a safe, stimulating and multi-cultural environment which endorses learning through play. We follow the British Early Years Foundation Stage curriculum (EYFS) and strive to nurture the whole child while offering a variety of interesting and hands-on activities meant to motivate children to become more confident and independent learners.
    </p>
    <p>
      From our Principal to all our teachers and staff, each employee at Toddlers International Nursery is experienced and well trained to meet your child’s needs and make them feel happy, safe and secure. At TIN we build on the diversity and richness of experiences that children bring to the nursery. We always strive to ensure that their family backgrounds, cultural heritage and interests are positively celebrated as we know that this will have a positive effect on children’s learning and self-esteem.
      <a href="#" class="text-blue-600 font-medium underline ml-1">More</a>
    </p>
  </div>
</div>


    <!-- Right Image -->
    <div class="md:w-[45%] w-full flex justify-center md:justify-end">
      <img src="assets/img1.webp"
           alt="Child"
           class="w-[300px] h-[400px] sm:w-[400px] sm:h-[500px] md:w-[520px] md:h-[620px] lg:w-[600px] lg:h-[720px] object-cover rounded-md shadow-md" />
    </div>

  </div>
</section>

<!---------------------------------------------------------- curriculum ----------------------------------------------------------------------->


<section class="max-w-[1000px] mx-auto px-4 py-12">
  <div class="text-center mb-8">
    <h2 class="text-3xl " style="font-family: 'Mochiy Pop One', sans-serif;">Our Curriculum</h2>
    <p class="mt-2 text-base sm:text-lg md:text-xl  font-happy monkey">“Play is the work of children.” – Maria Montessori</p>
  </div>
  <!-- Two Cards Section -->
  <div class="max-w-[1000px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-happy">
    
    <!-- Prime Areas Card -->
    <div class="bg-[#FDF6EA] rounded-xl overflow-hidden shadow-md">
      <img src="/assets/img2.webp" alt="Prime Areas" class="w-full h-48 object-cover">
      <div class="p-6">
        <h3 class="text-xl font-semibold text-[#055DA9] mb-4">The Prime Areas:</h3>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Communication and Language</li>
          <li>Physical Development</li>
          <li>Personal Development</li>
          <li>Social and Emotional Development</li>
        </ul>
      </div>
    </div>

    <!-- Specific Areas Card -->
    <div class="bg-[#FDF6EA] rounded-xl overflow-hidden shadow-md">
      <img src="/assets/img3.webp" alt="Specific Areas" class="w-full h-48 object-cover">
      <div class="p-6">
        <h3 class="text-xl font-semibold text-[#055DA9] mb-4">The Specific Areas:</h3>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Literacy</li>
          <li>Mathematics</li>
          <li>Understanding the World</li>
          <li>Expressive Arts and Design</li>
        </ul>
      </div>
    </div>

  </div>

  <div class="text-center mt-10">
    <a href="#curriculum" class="bg-[#F8CF05] text-black px-10 py-4 text-lg rounded-full font-bold hover:brightness-110 transition font-happy">
      KNOW MORE
    </a>
  </div>
</section>

<!---------------------------------------------------------- testimonial--------------------------------------------------------------------- -->


<section class="bg-cover bg-center py-16" style="background-image: url('assets/img4.webp');">
  <div class="text-center mb-12 px-4">
    <h2 class="text-2xl sm:text-3xl text-gray-800 mb-2" style="font-family: 'Mochiy Pop One', sans-serif;">
      Parent's Testimonials
    </h2>
    <p class="text-base sm:text-lg md:text-xl text-gray-600 font-happy">
      Be part of the movement for sustainable education
    </p>
  </div>

  <!-- Testimonial Cards Wrapper -->
  <div class="flex flex-col sm:flex-row justify-center items-center gap-8 px-4 sm:px-6">
    <!-- Card 1 -->

    <div class="bg-[#FDF6EA] w-[314px] h-[401px] rounded-[6px] px-[42px] py-[47px] shadow-md font-happy">
      <p class="text-sm text-gray-800 mb-10 leading-relaxed ">
        My son was here for last 10 months and he loves going there. They have enough staff to take care of the kids. Very professional. No TV, which was the main reason why we chose this nursery.
      </p>

        <div class="flex items-center gap-4">
        <img src="assets/user.jpg" alt="User" class="w-10 h-10 rounded-full object-cover">
        <div>
          <p class="font-semibold">Sanish Joseph</p>
     
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div>

              <div class="flex md:block justify-between	 pt-4 md:pt-6 border-t w-full border-borderColor mt-4 md:mt-6">

              <div class="flex items-center justify-center">

                  <svg width="181" height="35" viewBox="0 0 181 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.2137 2.92705C16.513 2.00574 17.8164 2.00574 18.1158 2.92705L20.794 11.1696C20.9278 11.5816 21.3118 11.8605 21.745 11.8605H30.4117C31.3804 11.8605 31.7832 13.1002 30.9995 13.6696L23.988 18.7637C23.6375 19.0184 23.4908 19.4697 23.6247 19.8817L26.3029 28.1243C26.6022 29.0456 25.5477 29.8117 24.764 29.2423L17.7525 24.1481C17.402 23.8935 16.9274 23.8935 16.577 24.1481L9.56546 29.2423C8.78174 29.8117 7.72726 29.0456 8.02662 28.1243L10.7048 19.8817C10.8386 19.4697 10.692 19.0184 10.3415 18.7637L3.33 13.6696C2.54629 13.1002 2.94906 11.8605 3.91779 11.8605H12.5845C13.0177 11.8605 13.4017 11.5816 13.5355 11.1696L16.2137 2.92705Z" fill="#FFD600"/>
                  <path d="M52.6219 2.92705C52.9213 2.00574 54.2247 2.00574 54.524 2.92705L57.2022 11.1696C57.3361 11.5816 57.72 11.8605 58.1532 11.8605H66.8199C67.7887 11.8605 68.1914 13.1002 67.4077 13.6696L60.3962 18.7637C60.0457 19.0184 59.8991 19.4697 60.0329 19.8817L62.7111 28.1243C63.0105 29.0456 61.956 29.8117 61.1723 29.2423L54.1608 24.1481C53.8103 23.8935 53.3357 23.8935 52.9852 24.1481L45.9737 29.2423C45.19 29.8117 44.1355 29.0456 44.4348 28.1243L47.113 19.8817C47.2469 19.4697 47.1002 19.0184 46.7497 18.7637L39.7382 13.6696C38.9545 13.1002 39.3573 11.8605 40.326 11.8605H48.9927C49.4259 11.8605 49.8099 11.5816 49.9438 11.1696L52.6219 2.92705Z" fill="#FFD600"/>
                  <path d="M89.034 2.92705C89.3333 2.00574 90.6368 2.00574 90.9361 2.92705L93.6143 11.1696C93.7481 11.5816 94.1321 11.8605 94.5653 11.8605H103.232C104.201 11.8605 104.604 13.1002 103.82 13.6696L96.8083 18.7637C96.4578 19.0184 96.3112 19.4697 96.445 19.8817L99.1232 28.1243C99.4225 29.0456 98.3681 29.8117 97.5843 29.2423L90.5728 24.1481C90.2224 23.8935 89.7478 23.8935 89.3973 24.1481L82.3858 29.2423C81.6021 29.8117 80.5476 29.0456 80.8469 28.1243L83.5251 19.8817C83.659 19.4697 83.5123 19.0184 83.1618 18.7637L76.1503 13.6696C75.3666 13.1002 75.7694 11.8605 76.7381 11.8605H85.4048C85.838 11.8605 86.222 11.5816 86.3558 11.1696L89.034 2.92705Z" fill="#FFD600"/>
                  <path d="M125.442 2.92705C125.742 2.00574 127.045 2.00574 127.344 2.92705L130.022 11.1696C130.156 11.5816 130.54 11.8605 130.974 11.8605H139.64C140.609 11.8605 141.012 13.1002 140.228 13.6696L133.217 18.7637C132.866 19.0184 132.719 19.4697 132.853 19.8817L135.531 28.1243C135.831 29.0456 134.776 29.8117 133.993 29.2423L126.981 24.1481C126.631 23.8935 126.156 23.8935 125.805 24.1481L118.794 29.2423C118.01 29.8117 116.956 29.0456 117.255 28.1243L119.933 19.8817C120.067 19.4697 119.921 19.0184 119.57 18.7637L112.559 13.6696C111.775 13.1002 112.178 11.8605 113.146 11.8605H121.813C122.246 11.8605 122.63 11.5816 122.764 11.1696L125.442 2.92705Z" fill="#FFD600"/>
                  <path d="M162.214 2.92705C162.513 2.00574 163.816 2.00574 164.116 2.92705L166.794 11.1696C166.928 11.5816 167.312 11.8605 167.745 11.8605H176.412C177.38 11.8605 177.783 13.1002 176.999 13.6696L169.988 18.7637C169.637 19.0184 169.491 19.4697 169.625 19.8817L172.303 28.1243C172.602 29.0456 171.548 29.8117 170.764 29.2423L163.753 24.1481C163.402 23.8935 162.927 23.8935 162.577 24.1481L155.565 29.2423C154.782 29.8117 153.727 29.0456 154.027 28.1243L156.705 19.8817C156.839 19.4697 156.692 19.0184 156.341 18.7637L149.33 13.6696C148.546 13.1002 148.949 11.8605 149.918 11.8605H158.584C159.018 11.8605 159.402 11.5816 159.536 11.1696L162.214 2.92705Z" fill="#FFD600"/>
                  <mask id="mask0_0_110" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="148" y="2" width="30" height="28">
                  <path d="M162.214 2.92705C162.513 2.00574 163.816 2.00574 164.116 2.92705L166.794 11.1696C166.928 11.5816 167.312 11.8605 167.745 11.8605H176.412C177.38 11.8605 177.783 13.1002 176.999 13.6696L169.988 18.7637C169.637 19.0184 169.491 19.4697 169.625 19.8817L172.303 28.1243C172.602 29.0456 171.548 29.8117 170.764 29.2423L163.753 24.1481C163.402 23.8935 162.927 23.8935 162.577 24.1481L155.565 29.2423C154.782 29.8117 153.727 29.0456 154.027 28.1243L156.705 19.8817C156.839 19.4697 156.692 19.0184 156.341 18.7637L149.33 13.6696C148.546 13.1002 148.949 11.8605 149.918 11.8605H158.584C159.018 11.8605 159.402 11.5816 159.536 11.1696L162.214 2.92705Z" fill="#FFD600"/>
                  </mask>
                  <g mask="url(#mask0_0_110)">
                  <rect x="163.357" y="-1" width="26" height="44" fill="#E8E8E8"/>
                  </g>
                  </svg>

                  <span class="text-xs text-colorGray">
                  (4.5)
                  </span>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional cards can be added here -->


    <div class="bg-[#FDF6EA] w-[314px] h-[401px] rounded-[6px] px-[42px] py-[47px] shadow-md font-happy">
      <p class="text-sm text-gray-800 mb-10 leading-relaxed ">
        My son was here for last 10 months and he loves going there. They have enough staff to take care of the kids. Very professional. No TV, which was the main reason why we chose this nursery.
      </p>

        <div class="flex items-center gap-4">
        <img src="assets/user.jpg" alt="User" class="w-10 h-10 rounded-full object-cover">
        <div>
          <p class="font-semibold">Sanish Joseph</p>
     
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div>

              <div class="flex md:block justify-between	 pt-4 md:pt-6 border-t w-full border-borderColor mt-4 md:mt-6">

              <div class="flex items-center justify-center">

                  <svg width="181" height="35" viewBox="0 0 181 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.2137 2.92705C16.513 2.00574 17.8164 2.00574 18.1158 2.92705L20.794 11.1696C20.9278 11.5816 21.3118 11.8605 21.745 11.8605H30.4117C31.3804 11.8605 31.7832 13.1002 30.9995 13.6696L23.988 18.7637C23.6375 19.0184 23.4908 19.4697 23.6247 19.8817L26.3029 28.1243C26.6022 29.0456 25.5477 29.8117 24.764 29.2423L17.7525 24.1481C17.402 23.8935 16.9274 23.8935 16.577 24.1481L9.56546 29.2423C8.78174 29.8117 7.72726 29.0456 8.02662 28.1243L10.7048 19.8817C10.8386 19.4697 10.692 19.0184 10.3415 18.7637L3.33 13.6696C2.54629 13.1002 2.94906 11.8605 3.91779 11.8605H12.5845C13.0177 11.8605 13.4017 11.5816 13.5355 11.1696L16.2137 2.92705Z" fill="#FFD600"/>
                  <path d="M52.6219 2.92705C52.9213 2.00574 54.2247 2.00574 54.524 2.92705L57.2022 11.1696C57.3361 11.5816 57.72 11.8605 58.1532 11.8605H66.8199C67.7887 11.8605 68.1914 13.1002 67.4077 13.6696L60.3962 18.7637C60.0457 19.0184 59.8991 19.4697 60.0329 19.8817L62.7111 28.1243C63.0105 29.0456 61.956 29.8117 61.1723 29.2423L54.1608 24.1481C53.8103 23.8935 53.3357 23.8935 52.9852 24.1481L45.9737 29.2423C45.19 29.8117 44.1355 29.0456 44.4348 28.1243L47.113 19.8817C47.2469 19.4697 47.1002 19.0184 46.7497 18.7637L39.7382 13.6696C38.9545 13.1002 39.3573 11.8605 40.326 11.8605H48.9927C49.4259 11.8605 49.8099 11.5816 49.9438 11.1696L52.6219 2.92705Z" fill="#FFD600"/>
                  <path d="M89.034 2.92705C89.3333 2.00574 90.6368 2.00574 90.9361 2.92705L93.6143 11.1696C93.7481 11.5816 94.1321 11.8605 94.5653 11.8605H103.232C104.201 11.8605 104.604 13.1002 103.82 13.6696L96.8083 18.7637C96.4578 19.0184 96.3112 19.4697 96.445 19.8817L99.1232 28.1243C99.4225 29.0456 98.3681 29.8117 97.5843 29.2423L90.5728 24.1481C90.2224 23.8935 89.7478 23.8935 89.3973 24.1481L82.3858 29.2423C81.6021 29.8117 80.5476 29.0456 80.8469 28.1243L83.5251 19.8817C83.659 19.4697 83.5123 19.0184 83.1618 18.7637L76.1503 13.6696C75.3666 13.1002 75.7694 11.8605 76.7381 11.8605H85.4048C85.838 11.8605 86.222 11.5816 86.3558 11.1696L89.034 2.92705Z" fill="#FFD600"/>
                  <path d="M125.442 2.92705C125.742 2.00574 127.045 2.00574 127.344 2.92705L130.022 11.1696C130.156 11.5816 130.54 11.8605 130.974 11.8605H139.64C140.609 11.8605 141.012 13.1002 140.228 13.6696L133.217 18.7637C132.866 19.0184 132.719 19.4697 132.853 19.8817L135.531 28.1243C135.831 29.0456 134.776 29.8117 133.993 29.2423L126.981 24.1481C126.631 23.8935 126.156 23.8935 125.805 24.1481L118.794 29.2423C118.01 29.8117 116.956 29.0456 117.255 28.1243L119.933 19.8817C120.067 19.4697 119.921 19.0184 119.57 18.7637L112.559 13.6696C111.775 13.1002 112.178 11.8605 113.146 11.8605H121.813C122.246 11.8605 122.63 11.5816 122.764 11.1696L125.442 2.92705Z" fill="#FFD600"/>
                  <path d="M162.214 2.92705C162.513 2.00574 163.816 2.00574 164.116 2.92705L166.794 11.1696C166.928 11.5816 167.312 11.8605 167.745 11.8605H176.412C177.38 11.8605 177.783 13.1002 176.999 13.6696L169.988 18.7637C169.637 19.0184 169.491 19.4697 169.625 19.8817L172.303 28.1243C172.602 29.0456 171.548 29.8117 170.764 29.2423L163.753 24.1481C163.402 23.8935 162.927 23.8935 162.577 24.1481L155.565 29.2423C154.782 29.8117 153.727 29.0456 154.027 28.1243L156.705 19.8817C156.839 19.4697 156.692 19.0184 156.341 18.7637L149.33 13.6696C148.546 13.1002 148.949 11.8605 149.918 11.8605H158.584C159.018 11.8605 159.402 11.5816 159.536 11.1696L162.214 2.92705Z" fill="#FFD600"/>
                  <mask id="mask0_0_110" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="148" y="2" width="30" height="28">
                  <path d="M162.214 2.92705C162.513 2.00574 163.816 2.00574 164.116 2.92705L166.794 11.1696C166.928 11.5816 167.312 11.8605 167.745 11.8605H176.412C177.38 11.8605 177.783 13.1002 176.999 13.6696L169.988 18.7637C169.637 19.0184 169.491 19.4697 169.625 19.8817L172.303 28.1243C172.602 29.0456 171.548 29.8117 170.764 29.2423L163.753 24.1481C163.402 23.8935 162.927 23.8935 162.577 24.1481L155.565 29.2423C154.782 29.8117 153.727 29.0456 154.027 28.1243L156.705 19.8817C156.839 19.4697 156.692 19.0184 156.341 18.7637L149.33 13.6696C148.546 13.1002 148.949 11.8605 149.918 11.8605H158.584C159.018 11.8605 159.402 11.5816 159.536 11.1696L162.214 2.92705Z" fill="#FFD600"/>
                  </mask>
                  <g mask="url(#mask0_0_110)">
                  <rect x="163.357" y="-1" width="26" height="44" fill="#E8E8E8"/>
                  </g>
                  </svg>

                  <span class="text-xs text-colorGray">
                  (4.5)
                  </span>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="bg-[#FDF6EA] w-[314px] h-[401px] rounded-[6px] px-[42px] py-[47px] shadow-md font-happy">
      <p class="text-sm text-gray-800 mb-10 leading-relaxed ">
        My son was here for last 10 months and he loves going there. They have enough staff to take care of the kids. Very professional. No TV, which was the main reason why we chose this nursery.
      </p>

      
        <div class="flex items-center gap-4">
        <img src="assets/user.jpg" alt="User" class="w-10 h-10 rounded-full object-cover">
        <div>
          <p class="font-semibold">Sanish Joseph</p>
     
        </div>
      </div>
      <div class="flex items-center gap-4">

        <div>

            <div class="flex md:block justify-between	 pt-4 md:pt-6 border-t w-full border-borderColor mt-4 md:mt-6">

            <div class="flex items-center justify-center">

                <svg width="181" height="35" viewBox="0 0 181 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.2137 2.92705C16.513 2.00574 17.8164 2.00574 18.1158 2.92705L20.794 11.1696C20.9278 11.5816 21.3118 11.8605 21.745 11.8605H30.4117C31.3804 11.8605 31.7832 13.1002 30.9995 13.6696L23.988 18.7637C23.6375 19.0184 23.4908 19.4697 23.6247 19.8817L26.3029 28.1243C26.6022 29.0456 25.5477 29.8117 24.764 29.2423L17.7525 24.1481C17.402 23.8935 16.9274 23.8935 16.577 24.1481L9.56546 29.2423C8.78174 29.8117 7.72726 29.0456 8.02662 28.1243L10.7048 19.8817C10.8386 19.4697 10.692 19.0184 10.3415 18.7637L3.33 13.6696C2.54629 13.1002 2.94906 11.8605 3.91779 11.8605H12.5845C13.0177 11.8605 13.4017 11.5816 13.5355 11.1696L16.2137 2.92705Z" fill="#FFD600"/>
                <path d="M52.6219 2.92705C52.9213 2.00574 54.2247 2.00574 54.524 2.92705L57.2022 11.1696C57.3361 11.5816 57.72 11.8605 58.1532 11.8605H66.8199C67.7887 11.8605 68.1914 13.1002 67.4077 13.6696L60.3962 18.7637C60.0457 19.0184 59.8991 19.4697 60.0329 19.8817L62.7111 28.1243C63.0105 29.0456 61.956 29.8117 61.1723 29.2423L54.1608 24.1481C53.8103 23.8935 53.3357 23.8935 52.9852 24.1481L45.9737 29.2423C45.19 29.8117 44.1355 29.0456 44.4348 28.1243L47.113 19.8817C47.2469 19.4697 47.1002 19.0184 46.7497 18.7637L39.7382 13.6696C38.9545 13.1002 39.3573 11.8605 40.326 11.8605H48.9927C49.4259 11.8605 49.8099 11.5816 49.9438 11.1696L52.6219 2.92705Z" fill="#FFD600"/>
                <path d="M89.034 2.92705C89.3333 2.00574 90.6368 2.00574 90.9361 2.92705L93.6143 11.1696C93.7481 11.5816 94.1321 11.8605 94.5653 11.8605H103.232C104.201 11.8605 104.604 13.1002 103.82 13.6696L96.8083 18.7637C96.4578 19.0184 96.3112 19.4697 96.445 19.8817L99.1232 28.1243C99.4225 29.0456 98.3681 29.8117 97.5843 29.2423L90.5728 24.1481C90.2224 23.8935 89.7478 23.8935 89.3973 24.1481L82.3858 29.2423C81.6021 29.8117 80.5476 29.0456 80.8469 28.1243L83.5251 19.8817C83.659 19.4697 83.5123 19.0184 83.1618 18.7637L76.1503 13.6696C75.3666 13.1002 75.7694 11.8605 76.7381 11.8605H85.4048C85.838 11.8605 86.222 11.5816 86.3558 11.1696L89.034 2.92705Z" fill="#FFD600"/>
                <path d="M125.442 2.92705C125.742 2.00574 127.045 2.00574 127.344 2.92705L130.022 11.1696C130.156 11.5816 130.54 11.8605 130.974 11.8605H139.64C140.609 11.8605 141.012 13.1002 140.228 13.6696L133.217 18.7637C132.866 19.0184 132.719 19.4697 132.853 19.8817L135.531 28.1243C135.831 29.0456 134.776 29.8117 133.993 29.2423L126.981 24.1481C126.631 23.8935 126.156 23.8935 125.805 24.1481L118.794 29.2423C118.01 29.8117 116.956 29.0456 117.255 28.1243L119.933 19.8817C120.067 19.4697 119.921 19.0184 119.57 18.7637L112.559 13.6696C111.775 13.1002 112.178 11.8605 113.146 11.8605H121.813C122.246 11.8605 122.63 11.5816 122.764 11.1696L125.442 2.92705Z" fill="#FFD600"/>
                <path d="M162.214 2.92705C162.513 2.00574 163.816 2.00574 164.116 2.92705L166.794 11.1696C166.928 11.5816 167.312 11.8605 167.745 11.8605H176.412C177.38 11.8605 177.783 13.1002 176.999 13.6696L169.988 18.7637C169.637 19.0184 169.491 19.4697 169.625 19.8817L172.303 28.1243C172.602 29.0456 171.548 29.8117 170.764 29.2423L163.753 24.1481C163.402 23.8935 162.927 23.8935 162.577 24.1481L155.565 29.2423C154.782 29.8117 153.727 29.0456 154.027 28.1243L156.705 19.8817C156.839 19.4697 156.692 19.0184 156.341 18.7637L149.33 13.6696C148.546 13.1002 148.949 11.8605 149.918 11.8605H158.584C159.018 11.8605 159.402 11.5816 159.536 11.1696L162.214 2.92705Z" fill="#FFD600"/>
                <mask id="mask0_0_110" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="148" y="2" width="30" height="28">
                <path d="M162.214 2.92705C162.513 2.00574 163.816 2.00574 164.116 2.92705L166.794 11.1696C166.928 11.5816 167.312 11.8605 167.745 11.8605H176.412C177.38 11.8605 177.783 13.1002 176.999 13.6696L169.988 18.7637C169.637 19.0184 169.491 19.4697 169.625 19.8817L172.303 28.1243C172.602 29.0456 171.548 29.8117 170.764 29.2423L163.753 24.1481C163.402 23.8935 162.927 23.8935 162.577 24.1481L155.565 29.2423C154.782 29.8117 153.727 29.0456 154.027 28.1243L156.705 19.8817C156.839 19.4697 156.692 19.0184 156.341 18.7637L149.33 13.6696C148.546 13.1002 148.949 11.8605 149.918 11.8605H158.584C159.018 11.8605 159.402 11.5816 159.536 11.1696L162.214 2.92705Z" fill="#FFD600"/>
                </mask>
                <g mask="url(#mask0_0_110)">
                <rect x="163.357" y="-1" width="26" height="44" fill="#E8E8E8"/>
                </g>
                </svg>

                <span class="text-xs text-colorGray">
                (4.5)
                </span>
            </div>
        </div>
        </div>
      </div>
    </div>


</section>

<!-- ----------------------------------------------------------find us-------------------------------------------------------------- -->


<section class="flex flex-col md:flex-row w-full h-auto">
  <!-- Left Background Image -->
  <div class="w-full md:w-1/2 h-[400px] md:h-auto bg-cover bg-center" 
       style="background-image: url('assets/img5.webp');">
  </div>

  <!-- Right Map Section -->
  <div class="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-6 md:p-12">
    <h2 class="text-2xl sm:text-3xl font-bold font-happyMonkey text-gray-800 mb-6">Find Us</h2>
    <iframe
      src="https://www.google.com/maps/embed?pb=..."
      width="100%"
      height="350"
      style="border:0;"
      allowfullscreen=""
      loading="lazy"
      class="rounded-md shadow-md"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </div>
</section>

<!-- ---------------------------------------------gallery--------------------------------------- -->

<section class="bg-[#FFFAF0] py-12 px-6 sm:px-12 lg:px-20 text-center">
  <!-- Title -->
  <h2 class="text-2xl sm:text-3xl  text-gray-900 mb-2" style="font-family: 'Mochiy Pop One', sans-serif;">Our Gallery</h2>
  <p class="text-gray-700 text-base sm:text-lg md:text-xl  mb-10 font-happy">Be part of the movement for sustainable education</p>

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
  </div>

  <!-- Button -->
  <div class="mt-10">
    <button class="bg-[#F8CF05] text-black px-10 py-4 text-lg rounded-full font-bold hover:brightness-110 transition font-happy">
      VIEW MORE
    </button>
  </div>
</section>

<!----------------------------------------------------------------form--------------------------------------------------------------------------- -->
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

</body>
</html>
