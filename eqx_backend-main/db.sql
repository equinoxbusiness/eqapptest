-- Adminer 4.8.1 MySQL 8.0.30 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `category` (`id`, `name`, `active`) VALUES
(1,	'Marketing',	1),
(2,	'Finance',	1),
(3,	'Partnership',	1),
(4,	'Internal',	1),
(8,	'Others',	1);

DROP TABLE IF EXISTS `fund_transfer`;
CREATE TABLE `fund_transfer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `from_wallet` varchar(100) NOT NULL,
  `to_wallet` varchar(100) NOT NULL,
  `amount` varchar(20) NOT NULL,
  `proposed_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` int DEFAULT '0',
  `fund_transfer_index` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `fund_transfer_vote`;
CREATE TABLE `fund_transfer_vote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `fund_transfer_id` int NOT NULL,
  `vote` tinyint NOT NULL DEFAULT '1',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `proposal_id` (`fund_transfer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `ico`;
CREATE TABLE `ico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL COMMENT 'project_name + token_tiker',
  `assets` varchar(100) DEFAULT NULL,
  `ico_address` varchar(100) NOT NULL,
  `supply` varchar(100) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `offer_price` varchar(100) NOT NULL,
  `soft_cap` varchar(100) NOT NULL,
  `hard_cap` varchar(100) NOT NULL,
  `finalized` tinyint NOT NULL DEFAULT '0',
  `reached` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ico_address` (`ico_address`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `indexes`;
CREATE TABLE `indexes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `index_number` int NOT NULL,
  `org_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `data` varchar(255) NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `indexes` (`id`, `index_number`, `org_id`, `type`, `data`, `status`) VALUES
(1,	1,	1,	'add_proposal',	'1',	NULL),
(2,	1,	1,	'add_member',	'0x61Dd481A114A2E761c554B641742C973867899D3',	NULL),
(3,	1,	1,	'remove_member',	'1',	NULL),
(4,	2,	1,	'add_member',	'0x623D9b5Ea9A38AcD9ce53e20863C52eF8b3B1359',	NULL),
(5,	3,	1,	'add_member',	'0x07b6b72140d9cdc81b81199a2eee6df118efaa9d',	NULL),
(6,	4,	1,	'add_member',	'0x1666144B75d693E72081335A6D6E7572A9890297',	NULL),
(7,	2,	1,	'add_proposal',	'2',	NULL);

DROP TABLE IF EXISTS `member_vote`;
CREATE TABLE `member_vote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `voter_id` int NOT NULL,
  `vote` tinyint NOT NULL DEFAULT '1',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `voter_id` (`voter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `member_index` int DEFAULT NULL,
  `member_name` varchar(100) NOT NULL,
  `wallet_address` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(32) NOT NULL,
  `is_active` int NOT NULL DEFAULT '0',
  `join_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `join_ip` varchar(100) NOT NULL,
  `is_deployer` tinyint NOT NULL DEFAULT '0',
  `otp` varchar(10),
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallet_address` (`wallet_address`),
  UNIQUE KEY `email` (`email`),
  KEY `org_id` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `members` (`id`, `org_id`, `member_index`, `member_name`, `wallet_address`, `email`, `password`, `is_active`, `join_date`, `join_ip`, `is_deployer`, `otp`) VALUES
(1,	1,	NULL,	'Sunil Kutanoor',	'0x9c333A1A1dcC8C0d517EB5BEC014c0EDd5d76c2f',	'kutanoor@gmail.com',	'',	1,	'2022-07-18 15:35:43',	'2402:3a80:cff:31d4:dd3:2e30:9347:61bf',	1,	'4fe7a195'),
(2,	1,	NULL,	'Tushar Sengar',	'0x561d9d05F1E007F64a97c46959735222ced43c1C',	'tusharsengar26@gmail.com',	'',	1,	'2022-07-18 15:35:43',	'2402:3a80:cff:31d4:dd3:2e30:9347:61bf',	0,	'c1708bf3'),
(3,	1,	NULL,	'Tushar Devaliya',	'0xEf0220a177c4e14506CF8aBecb61af896AC7411F',	'tsrp86@gmail.com',	'',	1,	'2022-07-18 15:35:43',	'2402:3a80:cff:31d4:dd3:2e30:9347:61bf',	0,	'8118c93b'),
(4,	1,	NULL,	'Testing Member',	'0x61Dd481A114A2E761c554B641742C973867899D3',	'sbk773@gmail.com',	'',	-1,	'2022-08-04 08:14:48',	'2402:3a80:cfe:b22a:b598:3f2d:19d6:7b28',	0,	'7f9c1656'),
(17,	1,	NULL,	'Agresh Ranjan',	'0x623D9b5Ea9A38AcD9ce53e20863C52eF8b3B1359',	'agreshranjan@gmail.com',	'',	1,	'2022-08-10 10:19:32',	'2402:3a80:cda:ce46:1c11:4471:5392:44fa',	0,	'3c15cfe8'),
(18,	1,	NULL,	'Dominic Akan',	'0x07b6b72140d9cdc81b81199a2eee6df118efaa9d',	'dominicakp324@gmail.com',	'',	-1,	'2022-08-11 06:10:29',	'2402:3a80:cc3:1d80:e54f:ad51:f249:cf59',	0,	'93e08701'),
(19,	1,	NULL,	'Sumit Kumar',	'0x1666144B75d693E72081335A6D6E7572A9890297',	'coincurt@gmail.com',	'',	0,	'2022-08-11 06:15:44',	'2402:3a80:cc3:1d80:e54f:ad51:f249:cf59',	0,	'4f542df0');

DROP TABLE IF EXISTS `org`;
CREATE TABLE `org` (
  `id` int NOT NULL AUTO_INCREMENT,
  `multisig_address` varchar(100) NOT NULL,
  `deployer_name` varchar(100) NOT NULL,
  `wallet_address` varchar(100) NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `passport_no` varchar(50) DEFAULT NULL,
  `pan` varchar(20) DEFAULT NULL,
  `linkedin_link` varchar(255) DEFAULT NULL,
  `selfy` varchar(255) NOT NULL DEFAULT 'https://via.placeholder.com/200x200?text=Profile%20Pic',
  `add_member_index` int NOT NULL DEFAULT '0',
  `remove_member_index` int NOT NULL DEFAULT '0',
  `transfer_index` int NOT NULL DEFAULT '0',
  `proposal_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `multisig_address` (`multisig_address`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `wallet_address` (`wallet_address`),
  UNIQUE KEY `linkedin_link` (`linkedin_link`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `org` (`id`, `multisig_address`, `deployer_name`, `wallet_address`, `phone`, `email`, `passport_no`, `pan`, `linkedin_link`, `selfy`, `add_member_index`, `remove_member_index`, `transfer_index`, `proposal_index`) VALUES
(1,	'0x62C0FDfc12e2DeF58709EbcbC23cbC60E34b61dc',	'Sunil Kutanoor',	'0x9c333A1A1dcC8C0d517EB5BEC014c0EDd5d76c2f',	'0',	'kutanoor@gmail.com',	NULL,	'DCWPS4680F',	'https://www.linkedin.com/in/sunil-kutanoor-76451022b',	'https://storage.googleapis.com/eqxdata/Sunil Kutanoor/blob',	0,	0,	0,	0);

DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `project_name` varchar(100) NOT NULL,
  `cat_id` int NOT NULL,
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
  `other_doc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gtoken_address` (`gtoken_address`),
  UNIQUE KEY `org_id` (`org_id`),
  KEY `cat_id` (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `project_category`;
CREATE TABLE `project_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `project_category` (`id`, `name`, `active`) VALUES
(1,	'Music',	1),
(2,	'Finance',	1),
(3,	'Business',	1),
(4,	'Fashion',	1),
(5,	'Gaming',	1),
(6,	'Nonprofit',	1),
(7,	'Travel',	1),
(8,	'Others',	1);

DROP TABLE IF EXISTS `proposal`;
CREATE TABLE `proposal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `project_id` int NOT NULL,
  `category_id` int NOT NULL,
  `start_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time_in_days` int NOT NULL,
  `end_date` datetime NOT NULL,
  `description` text NOT NULL,
  `doc` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Initialized',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `org_id` (`org_id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `proposal` (`id`, `org_id`, `project_id`, `category_id`, `start_date`, `end_time_in_days`, `end_date`, `description`, `doc`, `status`) VALUES
(1,	1,	1,	2,	'2022-08-04 08:12:19',	3,	'2022-08-07 08:12:19',	'We are planning to mint Community native token for marketing and to rewards users. \r\n\r\nToken Name: Equinox Fan Token\r\nToken Ticker: EFT\r\nTotal Supply: 10,000,000 (Ten Millions)\r\n\r\nPlease vote on this idea.  ',	'https://storage.cloud.google.com/eqxdata/logo.png',	'Approved'),
(2,	1,	1,	2,	'2022-08-13 07:31:37',	3,	'2022-08-16 07:31:37',	'I would like to propose using Equinox DAO\'s treasury for raising funds into, to store Project tokens and to receive revenue from application and other sources. Apart from responsible asset management, this will also ensure collective control on project funds.',	'https://storage.cloud.google.com/eqxdata/logo.png',	'Approved');

DROP TABLE IF EXISTS `remove_members`;
CREATE TABLE `remove_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `member_index` int DEFAULT NULL,
  `member_name` varchar(100) NOT NULL,
  `wallet_address` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(32) NOT NULL,
  `is_active` int NOT NULL DEFAULT '0',
  `join_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `join_ip` varchar(100) NOT NULL,
  `is_deployer` tinyint NOT NULL DEFAULT '0',
  `otp` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `org_id` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `remove_members` (`id`, `org_id`, `member_index`, `member_name`, `wallet_address`, `email`, `password`, `is_active`, `join_date`, `join_ip`, `is_deployer`, `otp`) VALUES
(1,	1,	NULL,	'Testing Member',	'0x61Dd481A114A2E761c554B641742C973867899D3',	'sbk773@gmail.com',	'',	1,	'2022-08-04 09:31:47',	'2402:3a80:cfe:b22a:b598:3f2d:19d6:7b28',	0,	'0');

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `xApiKey` varchar(100) NOT NULL,
  `xApiSecret` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `settings` (`id`, `xApiKey`, `xApiSecret`) VALUES
(1,	'key_live_oIiDOmiftL074Rprl5PwMduLmxGnPJ2n',	'secret_live_QTcNqDKg412zUmpHwm3hlVVnG8vTZXH8');

DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `proposal_id` int NOT NULL,
  `vote` tinyint NOT NULL DEFAULT '1',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `proposal_id` (`proposal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `votes`;
CREATE TABLE `votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `member_id` int NOT NULL,
  `proposal_id` int NOT NULL,
  `proposal_type` int NOT NULL,
  `vote` tinyint NOT NULL DEFAULT '1',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `proposal_id` (`proposal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `votes` (`id`, `org_id`, `member_id`, `proposal_id`, `proposal_type`, `vote`, `date`) VALUES
(1,	1,	3,	1,	1,	1,	'2022-08-04 08:21:14'),
(2,	1,	1,	1,	1,	1,	'2022-08-04 08:23:02'),
(3,	1,	1,	1,	1,	1,	'2022-08-04 08:23:27'),
(4,	1,	1,	4,	2,	1,	'2022-08-04 08:24:06'),
(5,	1,	3,	4,	2,	1,	'2022-08-04 08:28:02'),
(6,	1,	2,	4,	2,	1,	'2022-08-04 09:29:13'),
(7,	1,	1,	1,	3,	1,	'2022-08-04 09:32:12'),
(8,	1,	2,	1,	3,	1,	'2022-08-04 09:35:49'),
(9,	1,	3,	1,	3,	1,	'2022-08-04 09:39:20'),
(10,	1,	1,	17,	2,	1,	'2022-08-10 10:20:02'),
(11,	1,	2,	17,	2,	1,	'2022-08-10 10:20:02'),
(12,	1,	3,	17,	2,	1,	'2022-08-10 16:57:14'),
(13,	1,	1,	18,	2,	1,	'2022-08-11 06:10:54'),
(14,	1,	1,	19,	2,	1,	'2022-08-11 06:16:22'),
(15,	1,	3,	18,	2,	1,	'2022-08-11 06:23:21'),
(16,	1,	3,	19,	2,	1,	'2022-08-11 06:23:45'),
(17,	1,	2,	19,	2,	1,	'2022-08-11 06:25:21'),
(18,	1,	2,	18,	2,	1,	'2022-08-11 06:25:55'),
(19,	1,	17,	18,	2,	0,	'2022-08-12 12:19:09'),
(20,	1,	2,	2,	1,	1,	'2022-08-13 07:32:39'),
(21,	1,	17,	19,	2,	1,	'2022-08-14 06:28:46'),
(22,	1,	1,	2,	1,	1,	'2022-08-14 06:37:32'),
(23,	1,	3,	2,	1,	1,	'2022-08-14 06:41:41'),
(24,	1,	3,	2,	1,	1,	'2022-08-14 06:42:07');

-- 2022-08-25 02:32:54
