export interface DivisionData {
  name: string;
  nameBn: string;
  districts: {
    name: string;
    nameBn: string;
    thanas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        name: 'Dhaka',
        nameBn: 'ঢাকা',
        thanas: [
          'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur',
          'Motijheel', 'Old Dhaka', 'Badda', 'Tejgaon', 'Khilgaon', 'Bashundhara',
          'Malibagh', 'Rampura', 'Shahbagh', 'Paltan', 'Jatrabari', 'Savar', 'Keraniganj', 'Dhamrai'
        ]
      },
      { name: 'Gazipur', nameBn: 'গাজীপুর', thanas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur'] },
      { name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', thanas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar'] },
      { name: 'Tangail', nameBn: 'টাঙ্গাইল', thanas: ['Tangail Sadar', 'Mirzapur', 'Gopalpur', 'Sakhipur', 'Madhupur'] },
      { name: 'Faridpur', nameBn: 'ফরিদপুর', thanas: ['Faridpur Sadar', 'Boalmari', 'Bhanga', 'Nagarkanda'] },
      { name: 'Manikganj', nameBn: 'মানিকগঞ্জ', thanas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Shibalaya'] },
      { name: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', thanas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Lohajang'] },
      { name: 'Narsingdi', nameBn: 'নরসিংদী', thanas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Raipura', 'Monohardi'] },
      { name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', thanas: ['Kishoreganj Sadar', 'Bajitpur', 'Bhairab', 'Katiadi'] },
      { name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', thanas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Tungipara'] },
      { name: 'Madaripur', nameBn: 'মাদারীপুর', thanas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'] },
      { name: 'Rajbari', nameBn: 'রাজবাড়ী', thanas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi'] },
      { name: 'Shariatpur', nameBn: 'শরীয়তপুর', thanas: ['Shariatpur Sadar', 'Damudya', 'Naria', 'Zajira'] }
    ]
  },
  {
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      { name: 'Chattogram', nameBn: 'চট্টগ্রাম', thanas: ['Kotwali', 'Panchlaish', 'Agrabad', 'Halishahar', 'Khulshi', 'Bakalia', 'Hathazari', 'Sitakunda', 'Patiya'] },
      { name: 'Cox\'s Bazar', nameBn: 'কক্সবাজার', thanas: ['Cox\'s Bazar Sadar', 'Ramu', 'Teknaf', 'Ukhia', 'Chakaria'] },
      { name: 'Cumilla', nameBn: 'কুমিল্লা', thanas: ['Cumilla Adarsha Sadar', 'Laksam', 'Debidwar', 'Chandina', 'Burichang'] },
      { name: 'Feni', nameBn: 'ফেনী', thanas: ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Parshuram'] },
      { name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', thanas: ['Brahmanbaria Sadar', 'Ashuganj', 'Kasba', 'Nabinagar'] },
      { name: 'Noakhali', nameBn: 'নোয়াখালী', thanas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companyganj', 'Senbagh'] },
      { name: 'Chandpur', nameBn: 'চাঁদপুর', thanas: ['Chandpur Sadar', 'Hajiganj', 'Matlab Uttar', 'Faridganj'] },
      { name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', thanas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati'] },
      { name: 'Rangamati', nameBn: 'রাঙ্গামাটি', thanas: ['Rangamati Sadar', 'Kaptai', 'Baghaichhari'] },
      { name: 'Bandarban', nameBn: 'বান্দরবান', thanas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Lama'] },
      { name: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', thanas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari'] }
    ]
  },
  {
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      { name: 'Rajshahi', nameBn: 'রাজশাহী', thanas: ['Boalia', 'Motihar', 'Rajpara', 'Paba', 'Godagari', 'Bagmara'] },
      { name: 'Bogura', nameBn: 'বগুড়া', thanas: ['Bogura Sadar', 'Sherpur', 'Shibganj', 'Gabtali', 'Dhunat'] },
      { name: 'Pabna', nameBn: 'পাবনা', thanas: ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Bera', 'Chatmohar'] },
      { name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', thanas: ['Sirajganj Sadar', 'Shahjadpur', 'Ullapara', 'Belkuchi'] },
      { name: 'Naogaon', nameBn: 'নওগাঁ', thanas: ['Naogaon Sadar', 'Patnitala', 'Dhamoirhat', 'Manda'] },
      { name: 'Natore', nameBn: 'নাটোর', thanas: ['Natore Sadar', 'Singra', 'Baraigram', 'Lalpur'] },
      { name: 'Chapai Nawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', thanas: ['Sadar', 'Shibganj', 'Bholahat', 'Nachole'] },
      { name: 'Joypurhat', nameBn: 'জয়পুরহাট', thanas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal'] }
    ]
  },
  {
    name: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      { name: 'Khulna', nameBn: 'খুলনা', thanas: ['Khulna Sadar', 'Sonadanga', 'Daulatpur', 'Khalishpur', 'Rupsha', 'Dumuria'] },
      { name: 'Jashore', nameBn: 'যশোর', thanas: ['Jashore Sadar', 'Jhikargachha', 'Sharsha', 'Abhaynagar', 'Keshabpur'] },
      { name: 'Satkhira', nameBn: 'সাতক্ষীরা', thanas: ['Satkhira Sadar', 'Kalaroa', 'Tala', 'Kaliganj', 'Shyamnagar'] },
      { name: 'Kushtia', nameBn: 'কুষ্টিয়া', thanas: ['Kushtia Sadar', 'Kumarkhali', 'Bheramara', 'Mirpur'] },
      { name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', thanas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Shailkupa'] },
      { name: 'Bagerhat', nameBn: 'বাগেরহাট', thanas: ['Bagerhat Sadar', 'Mongla', 'Fakirhat', 'Rampal'] },
      { name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', thanas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
      { name: 'Magura', nameBn: 'মাগুরা', thanas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha'] },
      { name: 'Narail', nameBn: 'নড়াইল', thanas: ['Narail Sadar', 'Lohagara', 'Kalia'] },
      { name: 'Meherpur', nameBn: 'মেহেরপুর', thanas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] }
    ]
  },
  {
    name: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      { name: 'Barishal', nameBn: 'বরিশাল', thanas: ['Kotwali', 'Airport', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Gournadi'] },
      { name: 'Patuakhali', nameBn: 'পটুয়াখালী', thanas: ['Patuakhali Sadar', 'Kalapara', 'Galachipa', 'Bauphal'] },
      { name: 'Bhola', nameBn: 'ভোলা', thanas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Lalmohan'] },
      { name: 'Pirojpur', nameBn: 'পিরোজপুর', thanas: ['Pirojpur Sadar', 'Bhandaria', 'Mathbaria', 'Nazirpur'] },
      { name: 'Barguna', nameBn: 'বরগুনা', thanas: ['Barguna Sadar', 'Amtali', 'Patharghata', 'Betagi'] },
      { name: 'Jhalokati', nameBn: 'ঝালকাঠি', thanas: ['Jhalokati Sadar', 'Nalchity', 'Rajapur', 'Kathalia'] }
    ]
  },
  {
    name: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      { name: 'Sylhet', nameBn: 'সিলেট', thanas: ['Kotwali', 'South Surma', 'Beanibazar', 'Golapganj', 'Osmani Nagar', 'Zakiganj'] },
      { name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', thanas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Kamalganj', 'Barlekha'] },
      { name: 'Habiganj', nameBn: 'হবিগঞ্জ', thanas: ['Habiganj Sadar', 'Madhabpur', 'Nabiganj', 'Bahubal', 'Chunarughat'] },
      { name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', thanas: ['Sunamganj Sadar', 'Jagannathpur', 'Chhatak', 'Tahirpur', 'Derai'] }
    ]
  },
  {
    name: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      { name: 'Rangpur', nameBn: 'রংপুর', thanas: ['Rangpur Sadar', 'Kotwali', 'Mithapukur', 'Pirganj', 'Badarganj'] },
      { name: 'Dinajpur', nameBn: 'দিনাজপুর', thanas: ['Dinajpur Sadar', 'Birganj', 'Parbatipur', 'Phulbari'] },
      { name: 'Kurigram', nameBn: 'কুড়িগ্রাম', thanas: ['Kurigram Sadar', 'Nageshwari', 'Ulipur', 'Chilmari'] },
      { name: 'Gaibandha', nameBn: 'গাইবান্ধা', thanas: ['Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sundarganj'] },
      { name: 'Nilphamari', nameBn: 'নীলফামারী', thanas: ['Nilphamari Sadar', 'Saidpur', 'Domar', 'Jaldhaka'] },
      { name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', thanas: ['Thakurgaon Sadar', 'Pirganj', 'Ranisankail'] },
      { name: 'Panchagarh', nameBn: 'পঞ্চগড়', thanas: ['Panchagarh Sadar', 'Tetulia', 'Boda', 'Debiganj'] },
      { name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', thanas: ['Lalmonirhat Sadar', 'Patgram', 'Hatibandha', 'Kaliganj'] }
    ]
  },
  {
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', thanas: ['Kotwali', 'Muktagachha', 'Trishal', 'Bhaluka', 'Phulpur', 'Gafargaon'] },
      { name: 'Jamalpur', nameBn: 'জামালপুর', thanas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Islampur'] },
      { name: 'Netrokona', nameBn: 'নেত্রকোণা', thanas: ['Netrokona Sadar', 'Kendua', 'Durgapur', 'Mohanganj'] },
      { name: 'Sherpur', nameBn: 'শেরপুর', thanas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati'] }
    ]
  }
];
