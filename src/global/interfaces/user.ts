import { Prisma, RegistrationStatus, TeamMemberRole } from "@prisma/client";

interface CreateUserBody {
  firstName: string;
  middleName: string | "" | null | undefined;
  lastName: string;
  email: string;
  collegeName: string;
  registrationId: string | null | undefined;
  username: string;
  phoneNumber: string;

  imageUrl: string | null | undefined;
}

interface UserUpdateBody {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  middleName: string | null | undefined;
  collegeName: string | null | undefined;
  registrationId: string | null | undefined;
  phoneNumber: string | null | undefined;
  imageUrl: string | null | undefined;
}

interface getMyTeamsResponseTeamRegistration {
  id: string;
  registrationStatus: string;
  role: string;
  team: {
    id: string;
    registrationStatus: RegistrationStatus;
    teamName: string;
    extraInformation: Prisma.JsonValue[];
    members: {
      id: string;
      registrationStatus: RegistrationStatus;
      role: TeamMemberRole;
      user: {
        id: string;
        username: string;
        firstName: string;
        middleName: string;
        lastName: string;
        imageUrl: string;
      };
    }[];
    event: {
      name: string;
    };
  };
}

export { CreateUserBody, UserUpdateBody, getMyTeamsResponseTeamRegistration };
