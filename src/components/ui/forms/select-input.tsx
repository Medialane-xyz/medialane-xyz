import { useField } from "formik";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../select";
import { cn } from "@/src/lib/utils";
import { InputProps, inputVariants } from "../input";
import { Label } from "../label";

type ISelectPropsType = {
  handleChange?: (value: any) => void;
  handleRenderValue?: (item: any) => string;
  handleSubText?: (item: any) => string;
  placeholder?: string;
  label?: string;
  labelClass?: string;
  objKey: string;
  loading?: boolean;
  data: any[];
  defaultValue?: string;
};

export const SelectInput = ({
  handleChange,
  handleRenderValue,
  placeholder,
  label,
  objKey,
  loading,
  data,
  defaultValue,
  variant,
  handleSubText,
  className,
  labelClass,
  inputSize,
  ...props
}: ISelectPropsType &
  InputProps &
  React.ComponentPropsWithoutRef<typeof Select>) => {
  const [field, meta, helpers] = useField(props.name || "");
  const [selectedValue, setSelectedValue] = useState(defaultValue || "");

  useEffect(() => {
    if (defaultValue) {
      helpers.setValue(defaultValue);
      setSelectedValue(defaultValue);
    }
  }, [defaultValue, helpers]);

  const findObjValue = (value: string) =>
    data.find(
      (item: any) =>
        handleRenderValue?.(item) === value || item[objKey] === value
    );

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    helpers.setValue(value);
    if (handleChange) {
      handleChange(findObjValue(value));
    }
  };

  return (
    <div className="transition-all grid gap-2">
      <Label
        htmlFor={props?.id || label}
        className={cn(
          "text-base font-semibold flex items-center space-x-2",
          labelClass
        )}
      >
        <span>{label}</span>
      </Label>
      <Select
        name={props.name}
        onValueChange={handleSelectChange}
        value={selectedValue}
      >
        <SelectTrigger
          className={cn(
            inputVariants({
              variant,
              inputSize,
              className,
            })
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {/* <SelectLabel>{label}</SelectLabel> */}
            {loading ? (
              "Loading..."
            ) : data && data.length > 0 ? (
              data.map((item: any, idx: number) => (
                <SelectItem
                  key={idx}
                  value={handleRenderValue?.(item) || item[objKey]}
                >
                  <div>
                    <div className="font-medium">
                      {handleRenderValue
                        ? handleRenderValue(item)
                        : item[objKey]}
                    </div>
                    {handleSubText && (
                      <div className="text-xs text-muted-foreground">
                        {handleSubText(item)}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <span>No Data Found</span>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>

      {meta.touched && meta.error ? (
        <div className="py-1 transition-all text-sm text-red-500">
          {meta.error}
        </div>
      ) : null}
    </div>
  );
};
