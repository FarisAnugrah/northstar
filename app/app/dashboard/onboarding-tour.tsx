"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { createClient } from "@/lib/supabase/client";

export function OnboardingTour() {
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    // Check if user has already seen the tour
    const checkTour = async () => {
      const seen = localStorage.getItem("northstar_tour_seen");
      if (!seen) {
        setShouldRun(true);
      }
    };
    
    checkTour();
  }, []);

  useEffect(() => {
    if (!shouldRun) return;

    // Small delay to ensure the DOM is fully rendered
    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: 'body',
            popover: {
              title: 'Welcome to Northstar! ✨',
              description: 'Let\'s take a quick tour to help you generate your first product document.',
              side: "top",
              align: 'center'
            }
          },
          {
            element: '.tour-new-project-btn',
            popover: {
              title: '1. Create a Project',
              description: 'Start here by creating a new project. You can organize by product, feature, or client.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-stats-card',
            popover: {
              title: '2. Track Progress',
              description: 'Keep an eye on how many documents your team has generated this month.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '.tour-projects-grid',
            popover: {
              title: '3. Manage Documents',
              description: 'Your created projects will appear here. Click into any project to fill the intake form and generate BRDs, PRDs, or Tech Specs.',
              side: "top",
              align: 'center'
            }
          }
        ],
        onDestroyStarted: () => {
          localStorage.setItem("northstar_tour_seen", "true");
          driverObj.destroy();
        }
      });

      driverObj.drive();
    }, 500);

    return () => clearTimeout(timeout);
  }, [shouldRun]);

  return null;
}
