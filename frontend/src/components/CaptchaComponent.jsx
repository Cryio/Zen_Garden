import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CaptchaComponent = ({ captcha, onChange, refreshCaptcha }) => {
  return (
    <div className="bg-[rgba(126,34,206,0.2)] p-3 rounded flex items-center justify-between">
      <span className="text-white">{captcha.challenge}</span>
      <Input
        type="text"
        placeholder="Your Answer"
        value={captcha.userAnswer}
        onChange={onChange}
        className="w-35 bg-[rgba(0,0,0,0.3)] text-[#a600c8] border-none h-10 text-center"
      />
      <Button
        type="button"
        variant="ghost"
        onClick={refreshCaptcha}
        className="text-[#94A3B8] hover:bg-[rgba(126,34,206,0.1)]"
      >
        Refresh
      </Button>
    </div>
  );
};

export default CaptchaComponent;
