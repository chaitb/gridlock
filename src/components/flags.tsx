import ae from "../assets/flags/ae.svg";
import at from "../assets/flags/at.svg";
import au from "../assets/flags/au.svg";
import az from "../assets/flags/az.svg";
import be from "../assets/flags/be.svg";
import bh from "../assets/flags/bh.svg";
import br from "../assets/flags/br.svg";
import ca from "../assets/flags/ca.svg";
import cn from "../assets/flags/cn.svg";
import es from "../assets/flags/es.svg";
import gb from "../assets/flags/gb.svg";
import hu from "../assets/flags/hu.svg";
import it from "../assets/flags/it.svg";
import jp from "../assets/flags/jp.svg";
import mc from "../assets/flags/mc.svg";
import mx from "../assets/flags/mx.svg";
import nl from "../assets/flags/nl.svg";
import qa from "../assets/flags/qa.svg";
import sa from "../assets/flags/sa.svg";
import sg from "../assets/flags/sg.svg";
import us from "../assets/flags/us.svg";

export const flags = {
	ae,
	at,
	au,
	az,
	be,
	bh,
	br,
	ca,
	cn,
	es,
	gb,
	hu,
	it,
	jp,
	mc,
	mx,
	nl,
	qa,
	sa,
	sg,
	us,
} as const;

export type CountryCode = keyof typeof flags;

export function Flag({ countryCode, className }: { countryCode: CountryCode; className?: string }) {
	return <img src={flags[countryCode]} alt={countryCode} className={className} />;
}
