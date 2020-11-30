import React from "react";

import { InlineLoading } from "carbon-components-react";
import { createErrorHandler } from "@openmrs/esm-error-handling";

import {
  fetchPatientRelationships,
  Relationship
} from "./relationships.resource";
import styles from "./contact-details.scss";

const Address: React.FC<{ address: fhir.Address }> = ({ address }) => {
  const { city, country, postalCode, state } = address;
  return (
    <div className={styles.col}>
      <p className={styles.heading}>Address</p>
      <ul>
        <li>{postalCode}</li>
        <li>{city}</li>
        <li>{state}</li>
        <li>{country}</li>
      </ul>
    </div>
  );
};

const Contact: React.FC<{ telecom: fhir.ContactPoint[] }> = ({ telecom }) => {
  const value = telecom ? telecom[0].value : "-";

  return (
    <div className={styles.col}>
      <p className={styles.heading}>Contact Details</p>
      <ul>
        <li>{value}</li>
      </ul>
    </div>
  );
};

const Relationships: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [relationships, setRelationships] = React.useState<
    ExtractedRelationship[]
  >(null);

  React.useEffect(() => {
    fetchPatientRelationships(patientId)
      .then(({ data: { results } }) => {
        if (results.length) {
          setRelationships(extractRelationshipData(results));
        }
      })
      .catch(createErrorHandler());
  }, [patientId]);

  const extractRelationshipData = (
    relationships: Relationship[]
  ): ExtractedRelationship[] => {
    const relationshipsData = [];
    for (const r of relationships) {
      if (patientId === r.personA.uuid) {
        relationshipsData.push({
          uuid: r.uuid,
          display: r.personB.display,
          relativeAge: r.personB.age,
          relativeUuid: r.personB.uuid,
          relationshipType: r.relationshipType.bIsToA
        });
      } else {
        relationshipsData.push({
          uuid: r.uuid,
          display: r.personA.display,
          relativeAge: r.personA.age,
          relativeUuid: r.personA.uuid,
          relationshipType: r.relationshipType.aIsToB
        });
      }
    }
    return relationshipsData;
  };

  const RenderRelationships = () => {
    if (relationships.length) {
      return (
        <ul style={{ width: "50%" }}>
          {relationships.map(r => (
            <li key={r.uuid} className={styles.relationship}>
              <div>{r.display}</div>
              <div>{r.relationshipType}</div>
              <div>{`${r.relativeAge} ${
                r.relativeAge === 1 ? "yr" : "yrs"
              }`}</div>
            </li>
          ))}
        </ul>
      );
    }
    return <p>-</p>;
  };

  return (
    <div className={styles.col}>
      <p className={styles.heading}>Relationships</p>
      {relationships ? (
        <RenderRelationships />
      ) : (
        <InlineLoading description="Loading..." />
      )}
    </div>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({
  address,
  telecom,
  patientId
}) => {
  const currentAddress = address.find(a => a.use === "home");

  return (
    <div className={styles.contactDetails}>
      <div className={styles.row}>
        <Address address={currentAddress} />
        <Contact telecom={telecom} />
      </div>
      <div className={styles.row}>
        <Relationships patientId={patientId} />
      </div>
    </div>
  );
};

export default ContactDetails;

type ContactDetailsProps = {
  address: fhir.Address[];
  telecom: fhir.ContactPoint[];
  patientId: string;
};

type ExtractedRelationship = {
  uuid: string;
  display: string;
  relativeAge: number;
  relativeUuid: string;
  relationshipType: string;
};