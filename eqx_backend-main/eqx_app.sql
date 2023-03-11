-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 03, 2022 at 05:21 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eqx_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `active`) VALUES
(1, 'Travel', 1),
(2, 'Finance', 1),
(3, 'MusicDAO', 1),
(4, 'FashionDAO', 1),
(5, 'BusinessDAO', 1),
(6, 'GamingDAO', 1),
(7, 'NonprofitDAO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `fund_transfer`
--

CREATE TABLE `fund_transfer` (
  `id` int(11) NOT NULL,
  `org_id` int(11) NOT NULL,
  `from_wallet` varchar(100) NOT NULL,
  `to_wallet` varchar(100) NOT NULL,
  `amount` varchar(20) NOT NULL,
  `proposed_date` datetime NOT NULL DEFAULT current_timestamp(),
  `finished_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(4) DEFAULT 0,
  `fund_transfer_index` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `fund_transfer_vote`
--

CREATE TABLE `fund_transfer_vote` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `fund_transfer_id` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL DEFAULT 1,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `ico`
--

CREATE TABLE `ico` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL COMMENT 'project_name + token_tiker',
  `assets` varchar(100) DEFAULT NULL,
  `ico_address` varchar(100) NOT NULL,
  `supply` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `offer_price` varchar(100) NOT NULL,
  `soft_cap` varchar(100) NOT NULL,
  `hard_cap` varchar(100) NOT NULL,
  `finalized` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `indexes`
--

CREATE TABLE `indexes` (
  `id` int(11) NOT NULL,
  `index_number` int(11) NOT NULL,
  `org_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `data` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `org_id` int(11) NOT NULL,
  `member_index` int(11) NOT NULL,
  `member_name` varchar(100) NOT NULL,
  `wallet_address` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(32) NOT NULL,
  `is_active` int(11) NOT NULL DEFAULT 0,
  `join_date` datetime NOT NULL DEFAULT current_timestamp(),
  `join_ip` varchar(100) NOT NULL,
  `is_deployer` tinyint(4) NOT NULL DEFAULT 0,
  `otp` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `member_vote`
--

CREATE TABLE `member_vote` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `voter_id` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL DEFAULT 1,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `org`
--

CREATE TABLE `org` (
  `id` int(11) NOT NULL,
  `multisig_address` varchar(100) NOT NULL,
  `deployer_name` varchar(100) NOT NULL,
  `wallet_address` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passport_no` varchar(50) DEFAULT NULL,
  `pan` varchar(20) DEFAULT NULL,
  `linkedin_link` varchar(255) NOT NULL,
  `selfy` varchar(255) NOT NULL DEFAULT 'https://via.placeholder.com/200x200?text=Profile%20Pic',
  `add_member_index` int(11) NOT NULL DEFAULT 0,
  `remove_member_index` int(11) NOT NULL DEFAULT 0,
  `transfer_index` int(11) NOT NULL DEFAULT 0,
  `proposal_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `org_id` int(11) NOT NULL,
  `project_name` varchar(100) NOT NULL,
  `cat_id` int(11) NOT NULL,
  `project_site` varchar(200) NOT NULL,
  `project_email` varchar(100) NOT NULL,
  `project_description` text NOT NULL,
  `gtoken_address` varchar(100) NOT NULL,
  `telegram` varchar(200) DEFAULT NULL,
  `twitter` varchar(200) NOT NULL,
  `facebook` varchar(200) NOT NULL,
  `github` varchar(200) DEFAULT NULL,
  `token_name` varchar(100) NOT NULL,
  `token_ticker` varchar(50) NOT NULL,
  `fixed_supply` varchar(100) NOT NULL,
  `token_logo` varchar(255) NOT NULL,
  `whitepaper` varchar(255) DEFAULT NULL,
  `incorporation` varchar(255) DEFAULT NULL,
  `other_doc` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `proposal`
--

CREATE TABLE `proposal` (
  `id` int(11) NOT NULL,
  `org_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `start_date` datetime NOT NULL DEFAULT current_timestamp(),
  `end_time_in_days` int(11) NOT NULL,
  `end_date` datetime NOT NULL,
  `description` text NOT NULL,
  `doc` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Initialized'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `xApiKey` varchar(100) NOT NULL,
  `xApiSecret` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `xApiKey`, `xApiSecret`) VALUES
(1, 'key_live_oIiDOmiftL074Rprl5PwMduLmxGnPJ2n', 'secret_live_QTcNqDKg412zUmpHwm3hlVVnG8vTZXH8');

-- --------------------------------------------------------

--
-- Table structure for table `vote`
--

CREATE TABLE `vote` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL DEFAULT 1,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fund_transfer`
--
ALTER TABLE `fund_transfer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fund_transfer_vote`
--
ALTER TABLE `fund_transfer_vote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `proposal_id` (`fund_transfer_id`);

--
-- Indexes for table `ico`
--
ALTER TABLE `ico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ico_address` (`ico_address`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `indexes`
--
ALTER TABLE `indexes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type` (`type`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wallet_address` (`wallet_address`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `org_id` (`org_id`);

--
-- Indexes for table `member_vote`
--
ALTER TABLE `member_vote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `voter_id` (`voter_id`);

--
-- Indexes for table `org`
--
ALTER TABLE `org`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `multisig_address` (`multisig_address`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gtoken_address` (`gtoken_address`),
  ADD UNIQUE KEY `org_id` (`org_id`),
  ADD KEY `cat_id` (`cat_id`);

--
-- Indexes for table `proposal`
--
ALTER TABLE `proposal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `org_id` (`org_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vote`
--
ALTER TABLE `vote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `fund_transfer`
--
ALTER TABLE `fund_transfer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fund_transfer_vote`
--
ALTER TABLE `fund_transfer_vote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ico`
--
ALTER TABLE `ico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `indexes`
--
ALTER TABLE `indexes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_vote`
--
ALTER TABLE `member_vote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `org`
--
ALTER TABLE `org`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal`
--
ALTER TABLE `proposal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vote`
--
ALTER TABLE `vote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
