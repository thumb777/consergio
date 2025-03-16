"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  required = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOptions, setFilteredOptions] = useState(options || [])
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Filter options when search term changes or options update
  useEffect(() => {
    if (!options || options.length === 0) {
      setFilteredOptions([])
      return
    }
    
    if (searchTerm) {
      const filtered = options.filter((option) => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
  }, [searchTerm, options])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const selectedOption = options?.find((option) => option.value === value)

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && <Label className="mb-2 block">{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>}

      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedOption ? (
          <div className="flex items-center">
            {selectedOption.icon}
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          placeholder
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-[300px] w-full overflow-hidden rounded-md border bg-white shadow-lg">
          <div className="sticky top-0 z-10 bg-white p-2">
            <Input
              ref={inputRef}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto p-1">
            {filteredOptions && filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm",
                    "hover:bg-muted hover:text-muted-foreground",
                    value === option.value && "bg-muted",
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {value === option.value && <Check className="ml-auto h-4 w-4" />}
                </div>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}