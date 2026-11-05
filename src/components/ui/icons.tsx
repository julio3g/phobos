type IconProps = React.HTMLAttributes<SVGElement>

export const Icons = {
  toggleTheme: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title className="sr-only">Alterar Tema</title>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 3l0 18" />
      <path d="M12 9l4.65 -4.65" />
      <path d="M12 14.3l7.37 -7.37" />
      <path d="M12 19.6l8.85 -8.85" />
    </svg>
  ),
  flowerLotus: ({ className, ...props }: IconProps) => {
    const petal =
      'origin-[12px_20px] motion-safe:animate-bloom motion-reduce:opacity-100 opacity-0 [animation-fill-mode:forwards]'

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`motion-safe:animate-float ${className}`}
        aria-hidden="true"
        {...props}
      >
        {/* pétala central */}
        <path
          className={`${petal} [animation-delay:0ms]`}
          d="M15 12.9V12c0-4.4-3-8-3-8s-3 3.6-3 8v.9"
        />
        {/* pétalas intermediárias */}
        <path
          className={`${petal} [animation-delay:200ms]`}
          d="M9.7 8.3c-1.8-2-3.8-3.1-3.8-3.1s-.8 2.5-.5 5.4"
        />
        <path
          className={`${petal} [animation-delay:200ms]`}
          d="M18.6 10.6c.3-2.9-.5-5.4-.5-5.4s-2 1-3.8 3.1"
        />
        {/* pétalas externas (base) */}
        <path
          className={`${petal} [animation-delay:400ms]`}
          d="M12 20c0-5.5-4.5-10-10-10 0 5.5 4.5 10 10 10"
        />
        <path
          className={`${petal} [animation-delay:400ms]`}
          d="M12 20c5.5 0 10-4.5 10-10-5.5 0-10 4.5-10 10"
        />
      </svg>
    )
  },
}
