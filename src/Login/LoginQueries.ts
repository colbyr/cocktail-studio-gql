export const LOGIN_QUERY = `
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    __typename
    ... on LoginResultSuccess {
      token
      userId
    }
    ... on LoginResultFailure {
      reason
    }
  }
}
`;
