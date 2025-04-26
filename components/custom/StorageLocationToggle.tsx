import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useState } from "react";

type Option = { label: string; value: "local" | "cloud" };

const options: Option[] = [
  { label: "Local", value: "local" },
  { label: "Cloud", value: "cloud" }
];

const StorageLocationToggle = () => {
    const [storageLocation, setStorageLocation] = useState<Option | undefined>(options[0])

    const handleStorageLocation = (option: Option) => {
        setStorageLocation(option)
    }

    return (
        <Select value={storageLocation} onValueChange={(option) => handleStorageLocation(option as Option)}>
        <SelectTrigger className="w-32 bg-background">
          <SelectValue className="text-foreground text-sm native:text-lg" placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="w-36 bg-background">
          <SelectGroup>
            <SelectItem label="Local" value="local" />
            <SelectItem label="Cloud" value="cloud" />
          </SelectGroup>
        </SelectContent>
      </Select>
    )
}

export default StorageLocationToggle