import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@gestion/lib/utils";
import { useIsMobile } from "@gestion/hooks/use-mobile";
import { Button } from "@gestion/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@gestion/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@gestion/components/ui/popover";

type CenterOption = { group: string; options: { value: string; label: string }[] };

interface CenterComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CenterOption[];
  placeholder?: string;
  disabled?: boolean;
}


function normalizeSearch(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function CenterCombobox({
  id,
  value,
  onChange,
  options,
  placeholder = "Sélectionnez…",
  disabled,
}: CenterComboboxProps) {

  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allOptions = options.flatMap((g) => g.options);
  const selectedLabel = allOptions.find((o) => o.value === value)?.label ?? value;

  const filteredOptions = search.trim()
    ? options
        .map((g) => ({
          group: g.group,
          options: g.options.filter((o) => {
            const q = normalizeSearch(search);
            return (
              normalizeSearch(o.label).includes(q) ||
              normalizeSearch(o.value).includes(q)
            );
          }),
        }))
        .filter((g) => g.options.length > 0)
    : options;

  return (
    // `modal` sur mobile : à l'intérieur d'un Dialog (react-remove-scroll verrouille
    // le défilement hors de son contenu), un Popover porté dans <body> n'est pas
    // défilable au toucher. En mode modal, Radix monte son propre RemoveScroll autour
    // du contenu du Popover, qui devient la zone défilable active → la liste des
    // centres redevient scrollable au doigt sur téléphone.
    <Popover modal={isMobile} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal bg-background hover:bg-background"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? selectedLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>

          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Rechercher un centre…"
              value={search}
              onValueChange={setSearch}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandList className="max-h-[min(300px,calc(var(--radix-popover-content-available-height,340px)_-_3rem))] overflow-y-auto overflow-x-hidden overscroll-contain">
            {filteredOptions.length === 0 && (
              <CommandEmpty>Aucun centre trouvé.</CommandEmpty>
            )}
            {filteredOptions.map((group) =>
              group.group ? (
                <CommandGroup key={group.group} heading={group.group}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                group.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
