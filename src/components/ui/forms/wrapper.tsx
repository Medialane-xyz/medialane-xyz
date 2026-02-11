"use client";
import {
  Formik,
  FormikConfig,
  FormikValues,
  Form as FormikForm,
  FormikProps,
} from "formik";
import { FormHTMLAttributes, ReactNode } from "react";

type FormWrapperBaseProps<Values> = {
  formProps?: FormHTMLAttributes<HTMLFormElement>;
} & FormikConfig<Values>;

type FunctionChildrenProps<Values> = FormWrapperBaseProps<Values> & {
  children: (props: FormikProps<Values>) => ReactNode;
};

type NodeChildrenProps<Values> = FormWrapperBaseProps<Values> & {
  children: ReactNode;
};

export function FormWrapper<Values extends FormikValues>({
  children,
  formProps,
  ...formikProps
}: FunctionChildrenProps<Values> | NodeChildrenProps<Values>) {
  return (
    <Formik {...formikProps}>
      {(formikBag) => (
        <FormikForm {...formProps}>
          {typeof children === "function" ? children(formikBag) : children}
        </FormikForm>
      )}
    </Formik>
  );
}