import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { HealthFormValues } from '@/lib/utils'
import { JAKARTA_AREAS, CHRONIC_CONDITIONS } from '@/lib/utils'

interface HealthFormFieldsProps {
  form: UseFormReturn<HealthFormValues>
}

export function HealthFormFields({ form }: HealthFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your full name" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date of Birth */}
      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth</FormLabel>
            <FormControl>
              <DatePicker
                selected={field.value}
                onChange={(date: Date) => field.onChange(date)}
                dateFormat="MMMM d, yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                minDate={new Date("1900-01-01")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholderText="Select date of birth"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sex */}
      <FormField
        control={form.control}
        name="sex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sex</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Height */}
      <FormField
        control={form.control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Height (cm)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter your height" 
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weight with Unit */}
      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter your weight" 
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weightUnit"
          render={({ field }) => (
            <FormItem className="w-24">
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Address Area */}
      <FormField
        control={form.control}
        name="area"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {JAKARTA_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other Area (conditional) */}
      {form.watch('area') === 'Other' && (
        <FormField
          control={form.control}
          name="otherArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specify Area</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your area" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Blood Pressure */}
      <div className="space-y-2">
        <FormLabel>Blood Pressure (optional)</FormLabel>
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="bloodPressure.systolic"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Systolic"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodPressure.diastolic"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Diastolic"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Chronic Conditions */}
      <FormField
        control={form.control}
        name="chronicConditions"
        render={() => (
          <FormItem>
            <FormLabel>Chronic Conditions</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {CHRONIC_CONDITIONS.map((condition) => (
                <FormField
                  key={condition}
                  control={form.control}
                  name="chronicConditions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={condition}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(condition)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, condition])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== condition
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {condition}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other Chronic Condition */}
      {form.watch('chronicConditions')?.includes('Other') && (
        <FormField
          control={form.control}
          name="otherChronicCondition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specify Condition</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter condition" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Allergies */}
      <FormField
        control={form.control}
        name="allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allergies</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter any allergies" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 