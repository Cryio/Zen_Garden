import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

const refreshButtonClass = 
  "p-2 rounded-lg bg-transparent hover:bg-wax-flower-950/10 text-white border border-wax-flower-500/20 hover:border-wax-flower-500/40 transition-all focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-950";

const CaptchaComponent = ({ captcha, onChange, refreshCaptcha }) => {
  return (
    <div className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Enter the result"
        value={captcha.userAnswer}
        onChange={onChange}
        className="bg-wax-flower-950/20 text-wax-flower-200 border-none h-12 placeholder-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-200"
      />
      <span className="text-wax-flower-200 min-w-[100px]">{captcha.challenge}</span>
      <Button
        type="button"
        onClick={refreshCaptcha}
        className={refreshButtonClass}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CaptchaComponent;
