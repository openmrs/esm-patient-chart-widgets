import { NumberInput, TextArea, TextInput } from "carbon-components-react";
import { debounce } from "lodash-es";
import React, { Fragment } from "react";
import styles from "./vitals-biometrics-input.component.scss";

interface VitalsBiometricInputProps {
  title: string;
  onInputChange(evnt): void;
  textFields: Array<{
    name: string;
    separator?: string;
    type?: string | "text";
    value: number | string;
    className?: string;
  }>;
  unitSymbol?: string;
  textFieldWidth?: string;
  textFieldStyles?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
  isValidRange?: boolean;
}

const VitalsBiometricInput: React.FC<VitalsBiometricInputProps> = ({
  title,
  onInputChange,
  textFields,
  unitSymbol,
  textFieldStyles,
  textFieldWidth,
  placeholder,
  disabled,
  isValidRange: isValid
}) => {
  return (
    <div className={styles.inputContainer} style={{ width: textFieldWidth }}>
      <p className={styles.vitalsBiometricInputLabel01}>{title}</p>
      <div
        className={`${styles.textInputContainer} ${disabled &&
          styles.disableInput} ${isValid && styles.danger}`}
        style={{ ...textFieldStyles }}
      >
        <div className={styles.centerDiv}>
          {textFields.map(val => {
            return val.type === "text" ? (
              <Fragment key={val.name}>
                <TextInput
                  style={{ ...textFieldStyles }}
                  className={`${styles.textInput} ${disabled &&
                    styles.disableInput} ${val.className} ${isValid &&
                    styles.danger}`}
                  id={val.name}
                  name={val.name}
                  onChange={onInputChange}
                  labelText={""}
                  value={val.value}
                  title={val.name}
                />
                {val?.separator}
              </Fragment>
            ) : (
              <TextArea
                key={val.name}
                style={{ ...textFieldStyles }}
                className={styles.textArea}
                id={val.name}
                name={val.name}
                labelText={""}
                onChange={onInputChange}
                rows={2}
                placeholder={placeholder}
                value={val.value}
                title={val.name}
              />
            );
          })}
        </div>
        <p className={styles.unitName}>{unitSymbol}</p>
      </div>
    </div>
  );
};

export default VitalsBiometricInput;
