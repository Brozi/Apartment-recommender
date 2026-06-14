import ApartmentIcon from "../icons/apartment-icon";
import HouseIcon from "../icons/house-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import FlatValuationForm from "./flat-valuation-form";
import ValuationFormBox from "./valuation-form-box";
import styles from "./valuation-form.module.css";

export default function ValuationForm() {
  return (
    <ValuationFormBox>
      <Tabs defaultValue="flat">
        <TabsList className={styles.tabsList}>
          <TabsTrigger
            icon={<ApartmentIcon color="currentColor" />}
            value="flat"
          >
            Flat
          </TabsTrigger>
          <TabsTrigger icon={<HouseIcon color="currentColor" />} value="house">
            House
          </TabsTrigger>
        </TabsList>
        <TabsContent value="flat">
          <FlatValuationForm />
        </TabsContent>
        <TabsContent value="house">
          {/* for now */}
          <FlatValuationForm />
        </TabsContent>
      </Tabs>
    </ValuationFormBox>
  );
}
