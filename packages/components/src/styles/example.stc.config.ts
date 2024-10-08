
import type { StclandStyles } from '.'

const customStyles : StclandStyles = {
  table: {
    root: 'bg-secondary-main',
    table: 'table-fixed',
    header: 'text-s text-primary-main text-left',
    headerRow: '',
    headerCell: 'font-medium pl-6 pb-4',
    body: 'text-gray-100 px-6',
    row: 'border-t last:border-b border-primary-dark',
    cell: 'px-6 py-6',
    selectedRow: 'bg-gray-500',
    subRow: 'text-secondary-main border-none',
  },
  button: {
    root: 'flex w-fit items-center gap-1 min-w-32 p-2.5 text-sm font-medium text-gray-800',
    primary: {
      outlined: 'border border-primary-range-300 text-primary-main hover:border-primary-dark hover:bg-primary-range-200',
      solid: 'bg-gray-750 hover:bg-primary-range-900 text-primary-main'
    },
    secondary:{
      outlined: 'border border-secondary-main text-secondary-main hover:border-secondary-dark hover:bg-secondary-range-200',
      solid: 'bg-secondary-main hover:bg-secondary-range-900 text-gray-50',
    },
    neutral: {
      outlined: 'border border-gray-700 text-gray-500 hover:border-gray-600 hover:bg-gray-200',
      solid: 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    },
    sm: 'p-2 text-1.5xs',
    md: 'p-3 text-sm',
    lg: 'p-3 text-md',
    fullWidth: 'w-full',
    rounded: 'rounded-md',
    highlightOnHover: 'hover:bg-gray-600',
    icon: 'w-1.5 h-1.5 inline',
    disabled:  'bg-gray-300 text-gray-400 hover:bg-gray-350',
    button: 'w-full'
  },
}

export default customStyles