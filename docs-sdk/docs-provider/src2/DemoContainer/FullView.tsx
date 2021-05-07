import React from "react";
import Dialog, { DialogProps } from "rc-dialog";
import "rc-dialog/assets/index.css";
import s from "./index.scoped.less";

interface FullViewProps extends DialogProps {}

const FullView = ({ style, className, ...rest }: FullViewProps) => {
  return (
    <Dialog
      animation="zoom"
      maskAnimation="fade"
      {...rest}
      className={`${s.fullViewDialog ?? ""} ${className ?? ""}`}
    />
  );
};

export default FullView;
