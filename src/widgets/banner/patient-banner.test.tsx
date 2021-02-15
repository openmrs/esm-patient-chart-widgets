import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PatientBanner from "./patient-banner.component";
import { getStartedVisit, visitMode, visitStatus } from "../visit/visit-utils";
import { of } from "rxjs";

jest.unmock("lodash");
const lodash = jest.requireActual("lodash");
lodash.capitalize = jest
  .fn()
  .mockImplementation(s => s.charAt(0).toUpperCase() + s.slice(1));

function renderPatientBanner() {
  render(<PatientBanner />);
}

describe("<PatientBanner />", () => {
  beforeEach(() => {
    getStartedVisit.next(null);
  });

  it("clicking the button toggles displaying the patient's contact details", () => {
    renderPatientBanner();

    const showContactDetailsBtn = screen.getByRole("button", {
      name: "Show Contact Details"
    });

    fireEvent.click(showContactDetailsBtn);

    const hideContactDetailsBtn = screen.getByRole("button", {
      name: "Hide Contact Details"
    });
    expect(hideContactDetailsBtn).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("Contact Details")).toBeInTheDocument();

    fireEvent.click(hideContactDetailsBtn);

    expect(showContactDetailsBtn).toBeInTheDocument();
  });

  it("should display the Active Visit tag when there is an active visit", () => {
    getStartedVisit.next({
      mode: visitMode.NEWVISIT,
      status: visitStatus.NOTSTARTED
    });

    renderPatientBanner();

    expect(screen.queryByTitle("Active Visit")).toBeVisible();
  });

  it("should not display the Active Visit tag when there is not an active visit", () => {
    renderPatientBanner();

    expect(screen.queryByTitle("Active Visit")).toBeNull();
  });
});
