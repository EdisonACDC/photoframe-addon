import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  intervalSeconds: number;
  onIntervalChange: (value: number) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  intervalSeconds,
  onIntervalChange,
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            data-testid="settings-backdrop"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-card border-l border-card-border z-50 overflow-y-auto"
            data-testid="settings-panel"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Impostazioni</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  data-testid="button-close-settings"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-8">
                <div>
                  <Label className="text-sm font-medium mb-4 block">
                    Intervallo Slideshow
                  </Label>
                  <div className="space-y-4">
                    <Slider
                      value={[intervalSeconds]}
                      onValueChange={(values) => onIntervalChange(values[0])}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full"
                      data-testid="slider-interval"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>5s</span>
                      <span className="font-medium text-foreground">
                        {intervalSeconds}s
                      </span>
                      <span>60s</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-2">Info</h3>
                  <p className="text-sm text-muted-foreground">
                    PhotoFrame - Cornice Digitale per Home Assistant
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
