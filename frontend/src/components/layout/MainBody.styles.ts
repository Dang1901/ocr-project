import styled from "styled-components";
import { colors } from "@config/colors";

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  width: 100%;
  transition: width 0.3s ease;
  overflow: auto;
  background-color: ${colors.background};
`;

export { BodyContainer, ContentContainer };

