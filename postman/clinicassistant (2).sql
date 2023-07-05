-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 05, 2023 at 10:30 PM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 8.0.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clinicassistant`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `adminId` bigint(20) NOT NULL,
  `isAdmin` tinyint(4) NOT NULL DEFAULT 0,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phonenumber` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`adminId`, `isAdmin`, `email`, `password`, `phonenumber`, `firstname`, `lastname`, `active`, `createdAt`) VALUES
(1, 1, 'admin@gmail.com', '$2a$10$hHmY6rPXtzFRoBsWoseoae8XpcJF4rn/j.Sdw4P8/aJCKi./j2iGW', NULL, '', '', 0, '2023-07-05 23:24:50');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` bigint(20) NOT NULL,
  `startingTime` time NOT NULL,
  `finishingTime` time NOT NULL,
  `missedAppointment` tinyint(4) NOT NULL DEFAULT 0,
  `workTimeWorkTimeId` bigint(20) DEFAULT NULL,
  `patientPatientId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `startingTime`, `finishingTime`, `missedAppointment`, `workTimeWorkTimeId`, `patientPatientId`) VALUES
(1, '11:00:00', '11:30:00', 0, 1, NULL),
(2, '11:30:00', '12:00:00', 0, 1, NULL),
(3, '12:00:00', '12:30:00', 0, 1, NULL),
(4, '12:30:00', '13:00:00', 0, 1, NULL),
(5, '11:00:00', '11:30:00', 0, 2, NULL),
(6, '11:30:00', '12:00:00', 0, 2, NULL),
(7, '12:00:00', '12:30:00', 0, 2, NULL),
(8, '12:30:00', '13:00:00', 0, 2, NULL),
(9, '11:00:00', '11:30:00', 0, 3, NULL),
(10, '11:30:00', '12:00:00', 0, 3, NULL),
(11, '12:00:00', '12:30:00', 0, 3, NULL),
(12, '12:30:00', '13:00:00', 0, 3, NULL),
(13, '11:00:00', '11:30:00', 0, 4, NULL),
(14, '11:30:00', '12:00:00', 0, 4, NULL),
(15, '12:00:00', '12:30:00', 0, 4, NULL),
(16, '12:30:00', '13:00:00', 0, 4, NULL),
(17, '11:00:00', '11:30:00', 0, 5, NULL),
(18, '11:30:00', '12:00:00', 0, 5, NULL),
(19, '12:00:00', '12:30:00', 0, 5, NULL),
(20, '12:30:00', '13:00:00', 0, 5, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `areas`
--

CREATE TABLE `areas` (
  `areaId` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `governorateGovernorateId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `areas`
--

INSERT INTO `areas` (`areaId`, `name`, `governorateGovernorateId`) VALUES
(1, 'إدلب', 1),
(2, 'معرة النعمان', 1),
(3, 'أريحا', 1),
(4, 'حارم', 1),
(5, 'جسر الشغور', 1),
(6, 'الحسكة', 2),
(7, 'رأس العين', 2),
(8, 'المالكية', 2),
(9, 'القامشلي', 2),
(10, 'جبل سمعان', 3),
(11, 'أعزاز', 3),
(12, 'الأتارب', 3),
(13, 'الباب', 3),
(14, 'جرابلس', 3),
(15, 'دير حافر', 3),
(16, 'السفيرة', 3),
(17, 'عفرين', 3),
(18, 'عين العرب', 3),
(19, 'منبج', 3),
(20, 'حماه', 4),
(21, 'السقيلبية', 4),
(22, 'السلمية', 4),
(23, 'محردة', 4),
(24, 'مصياف', 4),
(25, 'حمص', 5),
(26, 'الرستن', 5),
(27, 'تدمر', 5),
(28, 'المخرّم', 5),
(29, 'القصير', 5),
(30, 'تلكلخ', 5),
(31, 'دير الزور', 6),
(32, 'البوكمال', 6),
(33, 'الميادين', 6),
(34, 'دمشق القديمة', 7),
(35, 'ساروجة', 7),
(36, 'القنوات', 7),
(37, 'جوبر', 7),
(38, 'الميدان', 7),
(39, 'الشاغور', 7),
(40, 'القدم', 7),
(41, 'كفر سوسة', 7),
(42, 'المزة', 7),
(43, 'دمر', 7),
(44, 'برزة', 7),
(45, 'القابون', 7),
(46, 'ركن الدين', 7),
(47, 'الصالحية', 7),
(48, 'المهاجرين', 7),
(49, 'اليرموك', 7),
(50, 'مركز ريف دمشق', 8),
(51, 'التل', 8),
(52, 'داريا', 8),
(53, 'دوما', 8),
(54, 'الزبداني', 8),
(55, 'قدسيا', 8),
(56, 'قطنا', 8),
(57, 'القطيفة', 8),
(58, 'النبك', 8),
(59, 'يبرود', 8),
(60, 'الكسوة', 8),
(61, 'السويداء', 9),
(62, 'شهبا', 9),
(63, 'صلخد', 9),
(64, 'طرطوس', 10),
(65, 'صافيتا', 10),
(66, 'دريكيش', 10),
(67, 'الشيخ بدر', 10),
(68, 'بانياس', 10),
(69, 'القنيطرة', 11),
(70, 'فيق', 11),
(71, 'اللاذقية', 12),
(72, 'القرداحة', 12),
(73, 'الحفّة', 12),
(74, 'جبلة', 12);

-- --------------------------------------------------------

--
-- Table structure for table `clinics`
--

CREATE TABLE `clinics` (
  `clinicId` bigint(20) NOT NULL,
  `clinicName` varchar(255) NOT NULL,
  `Latitude` decimal(17,15) NOT NULL,
  `Longitude` decimal(17,15) NOT NULL,
  `createdAt` datetime NOT NULL,
  `phonenumber` varchar(255) DEFAULT NULL,
  `numDoctors` int(11) NOT NULL DEFAULT 0,
  `areaAreaId` bigint(20) DEFAULT NULL,
  `specialtySpecialtyId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `clinics`
--

INSERT INTO `clinics` (`clinicId`, `clinicName`, `Latitude`, `Longitude`, `createdAt`, `phonenumber`, `numDoctors`, `areaAreaId`, `specialtySpecialtyId`) VALUES
(1, 'yamen new', '34.123456789987600', '38.123456789987600', '2023-07-05 23:25:28', NULL, 2, 1, 1),
(2, 'yamen new', '34.123456789987600', '38.123456789987600', '2023-07-05 23:25:28', NULL, 2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `doctorclinics`
--

CREATE TABLE `doctorclinics` (
  `id` bigint(20) NOT NULL,
  `appointmentDuring` int(11) NOT NULL,
  `daysToSeeLastAppointment` int(11) NOT NULL,
  `checkupPrice` int(11) DEFAULT 0,
  `doctorDoctorId` bigint(20) DEFAULT NULL,
  `clinicClinicId` bigint(20) DEFAULT NULL,
  `secretaryId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `doctorclinics`
--

INSERT INTO `doctorclinics` (`id`, `appointmentDuring`, `daysToSeeLastAppointment`, `checkupPrice`, `doctorDoctorId`, `clinicClinicId`, `secretaryId`) VALUES
(1, 0, 0, 0, 1, 1, NULL),
(2, 0, 0, 0, 1, 2, NULL),
(3, 30, 60, NULL, 2, 1, NULL),
(4, 0, 0, 0, 2, 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `doctorpatients`
--

CREATE TABLE `doctorpatients` (
  `id` bigint(20) NOT NULL,
  `evaluate` decimal(4,2) NOT NULL,
  `doctorDoctorId` bigint(20) DEFAULT NULL,
  `patientPatientId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `doctorId` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phonenumberForAdmin` varchar(255) NOT NULL,
  `active` enum('true','false') NOT NULL DEFAULT 'false',
  `accountBalance` int(11) NOT NULL DEFAULT 1,
  `dateToReactivate` date NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `gender` varchar(255) NOT NULL,
  `profilePicture` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `evaluate` decimal(4,2) NOT NULL DEFAULT 3.00,
  `numberOfPeopleWhoVoted` int(11) NOT NULL DEFAULT 0,
  `phonenumber` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`doctorId`, `description`, `email`, `phonenumberForAdmin`, `active`, `accountBalance`, `dateToReactivate`, `password`, `gender`, `profilePicture`, `firstname`, `lastname`, `evaluate`, `numberOfPeopleWhoVoted`, `phonenumber`, `createdAt`) VALUES
(1, NULL, 'yamen1@gmail.com', '0932691612', 'false', 0, '0000-00-00', NULL, 'male', NULL, 'yamen mahmoud', 'arksose', '3.00', 0, NULL, '0000-00-00 00:00:00'),
(2, NULL, 'yamen2@gmail.com', '0932691611', 'false', 0, '0000-00-00', NULL, 'male', NULL, 'yamen mahmoud', 'arksose', '3.00', 0, NULL, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `doctors_insurance_insurances`
--

CREATE TABLE `doctors_insurance_insurances` (
  `doctorsDoctorId` bigint(20) NOT NULL,
  `insurancesInsuranceId` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `doctors_insurance_insurances`
--

INSERT INTO `doctors_insurance_insurances` (`doctorsDoctorId`, `insurancesInsuranceId`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `doctors_sub_specialty_sub_specialties`
--

CREATE TABLE `doctors_sub_specialty_sub_specialties` (
  `doctorsDoctorId` bigint(20) NOT NULL,
  `subSpecialtiesSubSpecialtyId` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `doctors_sub_specialty_sub_specialties`
--

INSERT INTO `doctors_sub_specialty_sub_specialties` (`doctorsDoctorId`, `subSpecialtiesSubSpecialtyId`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `governorates`
--

CREATE TABLE `governorates` (
  `governorateId` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `governorates`
--

INSERT INTO `governorates` (`governorateId`, `name`) VALUES
(1, 'إدلب'),
(2, 'الحسكة'),
(9, 'الرقة'),
(11, 'السويداء'),
(13, 'القنيطرة'),
(14, 'اللاذقية'),
(3, 'حلب'),
(4, 'حماة'),
(5, 'حمص'),
(8, 'درعا'),
(7, 'دمشق'),
(6, 'دير الزور'),
(10, 'ريف دمشق'),
(12, 'طرطوس');

-- --------------------------------------------------------

--
-- Table structure for table `insurances`
--

CREATE TABLE `insurances` (
  `insuranceId` bigint(20) NOT NULL,
  `companyName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `insurances`
--

INSERT INTO `insurances` (`insuranceId`, `companyName`) VALUES
(1, 'NabelCsmpxfqny'),
(2, 'NabelCsmpxqny');

-- --------------------------------------------------------

--
-- Table structure for table `monthlysubscriptions`
--

CREATE TABLE `monthlysubscriptions` (
  `id` bigint(20) NOT NULL,
  `amountOfMoney` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `monthlysubscriptions`
--

INSERT INTO `monthlysubscriptions` (`id`, `amountOfMoney`) VALUES
(1, '40000');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `patientId` bigint(20) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 0,
  `profilePicture` varchar(255) DEFAULT NULL,
  `birthDate` date NOT NULL,
  `numberOfMissAppointment` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`patientId`, `gender`, `phoneNumber`, `password`, `firstname`, `lastname`, `active`, `profilePicture`, `birthDate`, `numberOfMissAppointment`) VALUES
(1, 'ذكر', '0932691631', '12313', 'يامن', 'عرقسةسي', 0, NULL, '1999-12-23', 0);

-- --------------------------------------------------------

--
-- Table structure for table `payinadvances`
--

CREATE TABLE `payinadvances` (
  `id` bigint(20) NOT NULL,
  `amountPaid` int(11) NOT NULL,
  `createdAt` date NOT NULL,
  `doctorDoctorId` bigint(20) DEFAULT NULL,
  `adminAdminId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `secretaries`
--

CREATE TABLE `secretaries` (
  `secretaryId` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phonenumber` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `privateId` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `specialties`
--

CREATE TABLE `specialties` (
  `specialtyId` bigint(20) NOT NULL,
  `specialtyName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `specialties`
--

INSERT INTO `specialties` (`specialtyId`, `specialtyName`) VALUES
(1, 'عين1ية');

-- --------------------------------------------------------

--
-- Table structure for table `subspecialties`
--

CREATE TABLE `subspecialties` (
  `subSpecialtyId` bigint(20) NOT NULL,
  `subSpecialtyName` varchar(255) NOT NULL,
  `specialtySpecialtyId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subspecialties`
--

INSERT INTO `subspecialties` (`subSpecialtyId`, `subSpecialtyName`, `specialtySpecialtyId`) VALUES
(1, 'عام', 1),
(2, 'eseeeee', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transctions`
--

CREATE TABLE `transctions` (
  `id` bigint(20) NOT NULL,
  `amountPaid` int(11) NOT NULL,
  `createdAt` date NOT NULL,
  `doctorDoctorId` bigint(20) DEFAULT NULL,
  `adminAdminId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `worktimes`
--

CREATE TABLE `worktimes` (
  `workTimeId` bigint(20) NOT NULL,
  `startingTime` time NOT NULL,
  `finishingTime` time NOT NULL,
  `day` enum('الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت') NOT NULL,
  `date` date NOT NULL,
  `doctorDoctorId` bigint(20) DEFAULT NULL,
  `clinicClinicId` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `worktimes`
--

INSERT INTO `worktimes` (`workTimeId`, `startingTime`, `finishingTime`, `day`, `date`, `doctorDoctorId`, `clinicClinicId`) VALUES
(1, '11:00:00', '13:00:00', 'الخميس', '2023-07-01', 2, 1),
(2, '11:00:00', '13:00:00', 'الخميس', '2023-07-20', 2, 1),
(3, '11:00:00', '13:00:00', 'الخميس', '2023-07-27', 2, 1),
(4, '11:00:00', '13:00:00', 'الخميس', '2023-08-03', 2, 1),
(5, '11:00:00', '13:00:00', 'الخميس', '2023-08-10', 2, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`adminId`),
  ADD UNIQUE KEY `IDX_051db7d37d478a69a7432df147` (`email`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_0a9bfb2b1778d62a40f184b2aee` (`workTimeWorkTimeId`),
  ADD KEY `FK_669db51cd07b8a65bee9aaf9c4a` (`patientPatientId`);

--
-- Indexes for table `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`areaId`),
  ADD KEY `FK_c18f5feeef338606bf75972ac8d` (`governorateGovernorateId`);

--
-- Indexes for table `clinics`
--
ALTER TABLE `clinics`
  ADD PRIMARY KEY (`clinicId`),
  ADD KEY `FK_29ec2630c46459e4f0b34427d93` (`areaAreaId`),
  ADD KEY `FK_d841dac1882e67cf4eb257f95de` (`specialtySpecialtyId`);

--
-- Indexes for table `doctorclinics`
--
ALTER TABLE `doctorclinics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_daaf4b8343a9a3b9acb554d5173` (`doctorDoctorId`),
  ADD KEY `FK_a763d35374b0182bf6a63d58c52` (`clinicClinicId`),
  ADD KEY `FK_f4fc135c30895eca359f864cd12` (`secretaryId`);

--
-- Indexes for table `doctorpatients`
--
ALTER TABLE `doctorpatients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_f3a573383ba6b86975227ec60b2` (`doctorDoctorId`),
  ADD KEY `FK_95770fe53c8342001e385dcb69f` (`patientPatientId`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`doctorId`),
  ADD UNIQUE KEY `IDX_62069f52ebba471c91de5d59d6` (`email`);

--
-- Indexes for table `doctors_insurance_insurances`
--
ALTER TABLE `doctors_insurance_insurances`
  ADD PRIMARY KEY (`doctorsDoctorId`,`insurancesInsuranceId`),
  ADD KEY `IDX_43a8aa8b5c4489e57e1bd94f8a` (`doctorsDoctorId`),
  ADD KEY `IDX_08a47036ae037b43174cbb5e7a` (`insurancesInsuranceId`);

--
-- Indexes for table `doctors_sub_specialty_sub_specialties`
--
ALTER TABLE `doctors_sub_specialty_sub_specialties`
  ADD PRIMARY KEY (`doctorsDoctorId`,`subSpecialtiesSubSpecialtyId`),
  ADD KEY `IDX_6e6e4f78103588e865357c23ae` (`doctorsDoctorId`),
  ADD KEY `IDX_cc4784eda360c715763f0a945a` (`subSpecialtiesSubSpecialtyId`);

--
-- Indexes for table `governorates`
--
ALTER TABLE `governorates`
  ADD PRIMARY KEY (`governorateId`),
  ADD UNIQUE KEY `IDX_e8f885d73cc73f8ac3c822da59` (`name`);

--
-- Indexes for table `insurances`
--
ALTER TABLE `insurances`
  ADD PRIMARY KEY (`insuranceId`),
  ADD UNIQUE KEY `IDX_a3b9d72cf96804391e5b1eb4e9` (`companyName`);

--
-- Indexes for table `monthlysubscriptions`
--
ALTER TABLE `monthlysubscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`patientId`),
  ADD UNIQUE KEY `IDX_4c813bfbb4223285d5508ce989` (`phoneNumber`);

--
-- Indexes for table `payinadvances`
--
ALTER TABLE `payinadvances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_5a817f3a67f3575cd1a7a8d91e4` (`doctorDoctorId`),
  ADD KEY `FK_892196d6241e15323ae3099d197` (`adminAdminId`);

--
-- Indexes for table `secretaries`
--
ALTER TABLE `secretaries`
  ADD PRIMARY KEY (`secretaryId`),
  ADD UNIQUE KEY `IDX_6a296665154a2878314c282394` (`email`),
  ADD UNIQUE KEY `IDX_547d269937ccd517073506d21b` (`privateId`);

--
-- Indexes for table `specialties`
--
ALTER TABLE `specialties`
  ADD PRIMARY KEY (`specialtyId`),
  ADD UNIQUE KEY `IDX_b3a6891b9cc827f8276ddb0e3c` (`specialtyName`);

--
-- Indexes for table `subspecialties`
--
ALTER TABLE `subspecialties`
  ADD PRIMARY KEY (`subSpecialtyId`),
  ADD KEY `FK_ad0758c26b21ef024c96e740587` (`specialtySpecialtyId`);

--
-- Indexes for table `transctions`
--
ALTER TABLE `transctions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_cff3a6cae20bd4a2f579d9e8bcb` (`doctorDoctorId`),
  ADD KEY `FK_1da749461e3fc8aabdefb1d38cd` (`adminAdminId`);

--
-- Indexes for table `worktimes`
--
ALTER TABLE `worktimes`
  ADD PRIMARY KEY (`workTimeId`),
  ADD KEY `FK_24dcdce2ac79272ddca7ca7b632` (`doctorDoctorId`),
  ADD KEY `FK_1eff1922eac5851fb7f0ef05432` (`clinicClinicId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `adminId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `areaId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `clinics`
--
ALTER TABLE `clinics`
  MODIFY `clinicId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `doctorclinics`
--
ALTER TABLE `doctorclinics`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `doctorpatients`
--
ALTER TABLE `doctorpatients`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `doctorId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `governorates`
--
ALTER TABLE `governorates`
  MODIFY `governorateId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `insurances`
--
ALTER TABLE `insurances`
  MODIFY `insuranceId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `monthlysubscriptions`
--
ALTER TABLE `monthlysubscriptions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `patientId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payinadvances`
--
ALTER TABLE `payinadvances`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `secretaries`
--
ALTER TABLE `secretaries`
  MODIFY `secretaryId` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `specialties`
--
ALTER TABLE `specialties`
  MODIFY `specialtyId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subspecialties`
--
ALTER TABLE `subspecialties`
  MODIFY `subSpecialtyId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transctions`
--
ALTER TABLE `transctions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `worktimes`
--
ALTER TABLE `worktimes`
  MODIFY `workTimeId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `FK_0a9bfb2b1778d62a40f184b2aee` FOREIGN KEY (`workTimeWorkTimeId`) REFERENCES `worktimes` (`workTimeId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_669db51cd07b8a65bee9aaf9c4a` FOREIGN KEY (`patientPatientId`) REFERENCES `patients` (`patientId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `FK_c18f5feeef338606bf75972ac8d` FOREIGN KEY (`governorateGovernorateId`) REFERENCES `governorates` (`governorateId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `clinics`
--
ALTER TABLE `clinics`
  ADD CONSTRAINT `FK_29ec2630c46459e4f0b34427d93` FOREIGN KEY (`areaAreaId`) REFERENCES `areas` (`areaId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_d841dac1882e67cf4eb257f95de` FOREIGN KEY (`specialtySpecialtyId`) REFERENCES `specialties` (`specialtyId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `doctorclinics`
--
ALTER TABLE `doctorclinics`
  ADD CONSTRAINT `FK_a763d35374b0182bf6a63d58c52` FOREIGN KEY (`clinicClinicId`) REFERENCES `clinics` (`clinicId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_daaf4b8343a9a3b9acb554d5173` FOREIGN KEY (`doctorDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_f4fc135c30895eca359f864cd12` FOREIGN KEY (`secretaryId`) REFERENCES `secretaries` (`secretaryId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `doctorpatients`
--
ALTER TABLE `doctorpatients`
  ADD CONSTRAINT `FK_95770fe53c8342001e385dcb69f` FOREIGN KEY (`patientPatientId`) REFERENCES `patients` (`patientId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_f3a573383ba6b86975227ec60b2` FOREIGN KEY (`doctorDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `doctors_insurance_insurances`
--
ALTER TABLE `doctors_insurance_insurances`
  ADD CONSTRAINT `FK_08a47036ae037b43174cbb5e7a3` FOREIGN KEY (`insurancesInsuranceId`) REFERENCES `insurances` (`insuranceId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_43a8aa8b5c4489e57e1bd94f8ac` FOREIGN KEY (`doctorsDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctors_sub_specialty_sub_specialties`
--
ALTER TABLE `doctors_sub_specialty_sub_specialties`
  ADD CONSTRAINT `FK_6e6e4f78103588e865357c23ae6` FOREIGN KEY (`doctorsDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_cc4784eda360c715763f0a945ae` FOREIGN KEY (`subSpecialtiesSubSpecialtyId`) REFERENCES `subspecialties` (`subSpecialtyId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `payinadvances`
--
ALTER TABLE `payinadvances`
  ADD CONSTRAINT `FK_5a817f3a67f3575cd1a7a8d91e4` FOREIGN KEY (`doctorDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_892196d6241e15323ae3099d197` FOREIGN KEY (`adminAdminId`) REFERENCES `admins` (`adminId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `subspecialties`
--
ALTER TABLE `subspecialties`
  ADD CONSTRAINT `FK_ad0758c26b21ef024c96e740587` FOREIGN KEY (`specialtySpecialtyId`) REFERENCES `specialties` (`specialtyId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `transctions`
--
ALTER TABLE `transctions`
  ADD CONSTRAINT `FK_1da749461e3fc8aabdefb1d38cd` FOREIGN KEY (`adminAdminId`) REFERENCES `admins` (`adminId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_cff3a6cae20bd4a2f579d9e8bcb` FOREIGN KEY (`doctorDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `worktimes`
--
ALTER TABLE `worktimes`
  ADD CONSTRAINT `FK_1eff1922eac5851fb7f0ef05432` FOREIGN KEY (`clinicClinicId`) REFERENCES `clinics` (`clinicId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_24dcdce2ac79272ddca7ca7b632` FOREIGN KEY (`doctorDoctorId`) REFERENCES `doctors` (`doctorId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
