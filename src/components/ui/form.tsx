'use client'

import { cn } from 'cn'
import * as React from 'react'
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

const Form = FormProvider

type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormItemContext = React.createContext<{ id: string } | null>(null)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()

  if (!fieldContext || !itemContext) {
    throw new Error('useFormField should be used within <FormField> and <FormItem>')
  }

  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)
  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

function FormItem({ className, ...props }: React.ComponentProps<typeof Field>) {
  const id = React.useId()
  const { error } = useFormFieldState()

  return (
    <FormItemContext.Provider value={{ id }}>
      <Field
        data-slot="form-item"
        data-invalid={!!error}
        className={cn('gap-1', className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

/** FormItem sits outside FormItemContext, so read field state by name only. */
function useFormFieldState() {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext?.name })

  return fieldContext
    ? getFieldState(fieldContext.name, formState)
    : { error: undefined }
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof FieldLabel>) {
  const { formItemId } = useFormField()

  return (
    <FieldLabel
      data-slot="form-label"
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  )
}

/** Radix-style slot: injects id/aria props into its single child. */
function FormControl({ children }: { children: React.ReactElement }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return React.cloneElement(children, {
    id: formItemId,
    'aria-describedby': error
      ? `${formDescriptionId} ${formMessageId}`
      : formDescriptionId,
    'aria-invalid': !!error,
  } as React.HTMLAttributes<HTMLElement>)
}

function FormDescription(props: React.ComponentProps<typeof FieldDescription>) {
  const { formDescriptionId } = useFormField()

  return (
    <FieldDescription
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  )
}

function FormMessage({
  children,
  ...props
}: React.ComponentProps<typeof FieldError>) {
  const { error, formMessageId } = useFormField()

  if (!error && !children) {
    return null
  }

  return (
    <FieldError data-slot="form-message" id={formMessageId} {...props}>
      {error ? String(error.message ?? '') : children}
    </FieldError>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
