import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import React, { FC } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { cross } from 'svg/misc';

import styles from './Modal.module.scss';
import ModalProps from './types';

const desktopVariants = {
  showHide: {
    bottom: 'calc(50% + 20px)',
    opacity: 0,
    x: '-50%',
    y: `50%`,
  },
  visible: {
    bottom: '50%',
    opacity: 1,
    x: '-50%',
    y: '50%',
  },
};

const variants = {
  showHide: {
    bottom: '-100%',
  },
  visible: {
    bottom: 0,
    opacity: 1,
  },
};

const Modal: FC<ModalProps> = ({
  bodyClassName,
  className,
  children,
  dataTest = 'Modal',
  header,
  Image,
  isOpen,
  isOverflowEnabled = true,
  isFullScreen,
  onClosePanel,
}) => {
  const { isDesktop } = useMediaQuery();

  return (
    <AnimatePresence initial={false}>
      {isOverflowEnabled && isOpen && (
        <motion.div
          key="modal-overflow"
          animate={{
            opacity: 1,
          }}
          className={cx(styles.overflow, isOpen && styles.isOpen)}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClosePanel}
        />
      )}
      {isOpen && (
        <motion.div
          key="modal-root"
          animate="visible"
          className={cx(styles.root, className)}
          exit="showHide"
          initial="showHide"
          transition={{ damping: 0.5 }}
          variants={isDesktop ? desktopVariants : variants}
        >
          {Image && <div className={styles.image}>{Image}</div>}
          <div className={cx(styles.body, Image && styles.hasImage, bodyClassName)}>
            {header && <div className={styles.header}>{header}</div>}
            {children}
          </div>
          <Button
            className={cx(styles.buttonClose, isFullScreen && styles.isFullScreen)}
            dataTest={`${dataTest}__Button`}
            Icon={<Svg img={cross} size={1} />}
            onClick={onClosePanel}
            variant="iconOnly"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
