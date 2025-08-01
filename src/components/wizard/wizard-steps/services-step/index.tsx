import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ServicesForm from "@/components/stakgraph/forms/ServicesForm";
import { ServicesData } from "@/components/stakgraph/types";
import { WizardStep } from "@/types/wizard";

interface ServicesStepProps {
  servicesData: ServicesData;
  onServicesChange: (data: Partial<ServicesData>) => void;
  onNext: () => void;
  onBack: () => void;
  onStepChange: (step: WizardStep) => void;
}

const ServicesStep = ({
  servicesData,
  onServicesChange,
  onNext,
  onBack,
  onStepChange,
}: ServicesStepProps) => {
  const handleBackToStep = (targetStep: WizardStep) => {
    onStepChange(targetStep);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card text-card-foreground">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="20" width="40" height="24" rx="6" fill="#F3F4F6" stroke="#60A5FA" strokeWidth="2" />
            <path d="M24 32h16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="32" r="4" fill="#60A5FA" />
          </svg>
        </div>
        <CardTitle className="text-2xl">Add Services</CardTitle>
        <CardDescription>Define your services, ports, and scripts for your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <ServicesForm
          data={servicesData}
          loading={false}
          onChange={partial => onServicesChange({ ...servicesData, ...partial, services: partial.services ?? servicesData.services })}
        />
        <div className="flex justify-between pt-6">
          <Button variant="outline" type="button" onClick={() => handleBackToStep(5)}>
            Back
          </Button>
          <Button className="px-8 bg-primary text-primary-foreground hover:bg-primary/90" type="button" onClick={onNext}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesStep;
