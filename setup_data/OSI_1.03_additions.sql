CREATE TABLE IF NOT EXISTS `OSI_1.01`.`bank_account` (
  `idpassenger` INT NOT NULL,
  `iduser` INT UNSIGNED NOT NULL,
  `balance` DECIMAL(6,2) NULL,
  PRIMARY KEY (`idpassenger`, `iduser`),
  CONSTRAINT `fk_bank_account_passenger1`
    FOREIGN KEY (`idpassenger` , `iduser`)
    REFERENCES `OSI_1.01`.`passenger` (`idpassenger` , `iduser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
